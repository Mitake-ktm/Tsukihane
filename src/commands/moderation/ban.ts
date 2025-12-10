import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { canModerate } from '../../utils/permissions';
import { logBan, logModeration } from '../../services/loggingService';
import { logModAction } from '../../services/moderationService';

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un utilisateur du serveur')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à bannir")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('raison')
            .setDescription('Raison du bannissement')
            .setRequired(false)
    )
    .addIntegerOption(option =>
        option
            .setName('jours')
            .setDescription('Nombre de jours de messages à supprimer (0-7)')
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export const permissions = [PermissionFlagsBits.BanMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const deleteDays = interaction.options.getInteger('jours') || 0;

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

    if (!member) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Cet utilisateur n'est pas sur le serveur.")],
            ephemeral: true,
        });
        return;
    }

    if (!canModerate(interaction.member as any, member)) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Tu ne peux pas bannir cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    if (!member.bannable) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Je ne peux pas bannir cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    try {
        await member.ban({ reason, deleteMessageDays: deleteDays });

        await interaction.reply({
            embeds: [successEmbed('Utilisateur Banni', `**${target.tag}** a été banni.\n**Raison:** ${reason}`)],
        });

        // Log the action
        await logBan(interaction.guild!.id, target, interaction.user, reason);
        logModAction(interaction.guild!.id, target.id, interaction.user.id, 'BAN', reason);
    } catch (error) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Une erreur s'est produite lors du bannissement.")],
            ephemeral: true,
        });
    }
}
