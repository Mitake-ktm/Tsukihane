import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { canModerate } from '../../utils/permissions';
import { logMute } from '../../services/loggingService';
import { logModAction } from '../../services/moderationService';
import { parseDuration, formatDuration } from '../../utils/time';

export const data = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un utilisateur temporairement')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à mute")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('durée')
            .setDescription('Durée du mute (ex: 10m, 1h, 1d)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('raison')
            .setDescription('Raison du mute')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);
    const durationStr = interaction.options.getString('durée', true);
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const duration = parseDuration(durationStr);
    if (!duration) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'Format de durée invalide. Utilise: 10s, 5m, 1h, 1d, 1w')],
            ephemeral: true,
        });
        return;
    }

    // Maximum timeout is 28 days
    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    if (duration > maxDuration) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'La durée maximum est de 28 jours.')],
            ephemeral: true,
        });
        return;
    }

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
            embeds: [errorEmbed('Erreur', "Tu ne peux pas mute cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    if (!member.moderatable) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Je ne peux pas mute cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    try {
        await member.timeout(duration, reason);

        const formattedDuration = formatDuration(duration);

        await interaction.reply({
            embeds: [successEmbed('Utilisateur Mute', `**${target.tag}** a été mute pour ${formattedDuration}.\n**Raison:** ${reason}`)],
        });

        await logMute(interaction.guild!.id, target, interaction.user, reason, formattedDuration);
        logModAction(interaction.guild!.id, target.id, interaction.user.id, 'MUTE', reason, `Durée: ${formattedDuration}`);
    } catch (error) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Une erreur s'est produite lors du mute.")],
            ephemeral: true,
        });
    }
}
