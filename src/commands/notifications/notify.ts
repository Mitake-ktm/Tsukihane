import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Envoyer une notification')
    .addSubcommand(subcommand =>
        subcommand
            .setName('chapter')
            .setDescription('Notifier la sortie d\'un chapitre')
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
            .addStringOption(option =>
                option
                    .setName('lien')
                    .setDescription('Lien vers le chapitre')
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Envoyer une notification d\'information')
            .addStringOption(option =>
                option
                    .setName('texte')
                    .setDescription('Le texte de la notification')
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
            const link = interaction.options.getString('lien') || '';

            const embed = new EmbedBuilder()
                .setTitle(`🔔 Nouveau Chapitre Disponible !`)
                .setDescription(
                    `**Chapitre ${number}**${title ? ` - ${title}` : ''}\n\n` +
                    `Le chapitre ${number} est maintenant disponible !` +
                    (link ? `\n\n📖 [Lire maintenant](${link})` : '')
                )
                .setColor(config.colors.success)
                .setTimestamp();

            await targetChannel.send({ content: '@everyone', embeds: [embed] });

            await interaction.reply({
                embeds: [successEmbed('Notification Envoyée', `La notification du chapitre ${number} a été envoyée.`)],
                ephemeral: true,
            });
            break;
        }

        case 'info': {
            const text = interaction.options.getString('texte', true);

            const embed = new EmbedBuilder()
                .setTitle('ℹ️ Information')
                .setDescription(text)
                .setColor(config.colors.info)
                .setFooter({ text: `Par ${interaction.user.tag}` })
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });

            await interaction.reply({
                embeds: [successEmbed('Notification Envoyée', 'La notification a été envoyée.')],
                ephemeral: true,
            });
            break;
        }
    }
}
