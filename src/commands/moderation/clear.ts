import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { logClear } from '../../services/loggingService';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer des messages dans le canal')
    .addIntegerOption(option =>
        option
            .setName('nombre')
            .setDescription('Nombre de messages à supprimer (1-100)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Supprimer uniquement les messages de cet utilisateur')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const permissions = [PermissionFlagsBits.ManageMessages];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('nombre', true);
    const targetUser = interaction.options.getUser('utilisateur');

    const channel = interaction.channel as TextChannel;

    if (!channel || !('bulkDelete' in channel)) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'Cette commande ne peut pas être utilisée dans ce canal.')],
            ephemeral: true,
        });
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        let messages = await channel.messages.fetch({ limit: amount });

        // Filter by user if specified
        if (targetUser) {
            messages = messages.filter(m => m.author.id === targetUser.id);
        }

        // Filter messages older than 14 days (can't bulk delete)
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

        if (messages.size === 0) {
            await interaction.editReply({
                embeds: [errorEmbed('Erreur', 'Aucun message à supprimer.')],
            });
            return;
        }

        const deleted = await channel.bulkDelete(messages, true);

        await interaction.editReply({
            embeds: [successEmbed('Messages Supprimés', `${deleted.size} message(s) supprimé(s).`)],
        });

        await logClear(interaction.guild!.id, interaction.user, channel, deleted.size);
    } catch (error) {
        await interaction.editReply({
            embeds: [errorEmbed('Erreur', 'Une erreur s\'est produite lors de la suppression des messages.')],
        });
    }
}
