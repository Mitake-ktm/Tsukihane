import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, TextChannel } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';

export const data = new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Gérer les canaux du serveur')
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Créer un nouveau canal')
            .addStringOption(option =>
                option
                    .setName('nom')
                    .setDescription('Nom du canal')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Type de canal')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Texte', value: 'text' },
                        { name: 'Vocal', value: 'voice' }
                    )
            )
            .addStringOption(option =>
                option
                    .setName('categorie')
                    .setDescription('ID de la catégorie')
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Supprimer un canal')
            .addChannelOption(option =>
                option
                    .setName('canal')
                    .setDescription('Le canal à supprimer')
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const permissions = [PermissionFlagsBits.ManageChannels];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'create': {
            const name = interaction.options.getString('nom', true);
            const type = interaction.options.getString('type', true);
            const categoryId = interaction.options.getString('categorie');

            try {
                const channelType = type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;

                const channel = await interaction.guild!.channels.create({
                    name,
                    type: channelType,
                    parent: categoryId || undefined,
                });

                await interaction.reply({
                    embeds: [successEmbed('Canal Créé', `Le canal ${channel} a été créé avec succès.`)],
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Impossible de créer le canal.')],
                    ephemeral: true,
                });
            }
            break;
        }

        case 'delete': {
            const channel = interaction.options.getChannel('canal', true);

            try {
                const channelName = channel.name;
                await (channel as TextChannel).delete();

                await interaction.reply({
                    embeds: [successEmbed('Canal Supprimé', `Le canal **${channelName}** a été supprimé.`)],
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Impossible de supprimer le canal.')],
                    ephemeral: true,
                });
            }
            break;
        }
    }
}
