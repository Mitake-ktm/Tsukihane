import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('post')
    .setDescription('Poster du contenu dans un canal')
    .addSubcommand(subcommand =>
        subcommand
            .setName('chapter')
            .setDescription('Annoncer un nouveau chapitre')
            .addIntegerOption(option =>
                option
                    .setName('numero')
                    .setDescription('Numéro du chapitre')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('titre')
                    .setDescription('Titre du chapitre')
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('announcement')
            .setDescription('Poster une annonce')
            .addStringOption(option =>
                option
                    .setName('texte')
                    .setDescription('Le texte de l\'annonce')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('titre')
                    .setDescription('Titre de l\'annonce')
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('project')
            .setDescription('Poster une mise à jour de projet')
            .addStringOption(option =>
                option
                    .setName('id')
                    .setDescription('ID du projet')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('contenu')
                    .setDescription('Contenu de la mise à jour')
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const permissions = [PermissionFlagsBits.ManageMessages];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    // Get announcement channel
    const channelId = config.channels.announcements;
    let targetChannel: TextChannel | null = null;

    if (channelId) {
        targetChannel = await interaction.guild?.channels.fetch(channelId).catch(() => null) as TextChannel | null;
    }

    if (!targetChannel) {
        targetChannel = interaction.channel as TextChannel;
    }

    switch (subcommand) {
        case 'chapter': {
            const number = interaction.options.getInteger('numero', true);
            const title = interaction.options.getString('titre') || '';

            const embed = new EmbedBuilder()
                .setTitle(`📖 Chapitre ${number}${title ? ` - ${title}` : ''}`)
                .setDescription(`Le chapitre ${number} est maintenant disponible ! Bonne lecture ! 📚`)
                .setColor(config.colors.primary)
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });

            await interaction.reply({
                embeds: [successEmbed('Publié', `L'annonce du chapitre ${number} a été publiée dans ${targetChannel}.`)],
                ephemeral: true,
            });
            break;
        }

        case 'announcement': {
            const text = interaction.options.getString('texte', true);
            const title = interaction.options.getString('titre') || '📢 Annonce';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(text)
                .setColor(config.colors.primary)
                .setFooter({ text: `Posté par ${interaction.user.tag}` })
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });

            await interaction.reply({
                embeds: [successEmbed('Publié', `L'annonce a été publiée dans ${targetChannel}.`)],
                ephemeral: true,
            });
            break;
        }

        case 'project': {
            const projectId = interaction.options.getString('id', true);
            const content = interaction.options.getString('contenu', true);

            const embed = new EmbedBuilder()
                .setTitle(`🛠️ Projet: ${projectId}`)
                .setDescription(content)
                .setColor(config.colors.info)
                .setFooter({ text: `Mise à jour par ${interaction.user.tag}` })
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });

            await interaction.reply({
                embeds: [successEmbed('Publié', `La mise à jour du projet a été publiée dans ${targetChannel}.`)],
                ephemeral: true,
            });
            break;
        }
    }
}
