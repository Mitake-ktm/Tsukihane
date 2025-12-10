import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { canModerate } from '../../utils/permissions';
import { logUnmute } from '../../services/loggingService';
import { logModAction } from '../../services/moderationService';

export const data = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le mute d\'un utilisateur')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à unmute")
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);

    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);

    if (!member) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Cet utilisateur n'est pas sur le serveur.")],
            ephemeral: true,
        });
        return;
    }

    if (!member.isCommunicationDisabled()) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Cet utilisateur n'est pas mute.")],
            ephemeral: true,
        });
        return;
    }

    if (!canModerate(interaction.member as any, member)) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Tu ne peux pas unmute cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    try {
        await member.timeout(null);

        await interaction.reply({
            embeds: [successEmbed('Utilisateur Unmute', `**${target.tag}** n'est plus mute.`)],
        });

        await logUnmute(interaction.guild!.id, target, interaction.user);
        logModAction(interaction.guild!.id, target.id, interaction.user.id, 'UNMUTE');
    } catch (error) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Une erreur s'est produite lors du unmute.")],
            ephemeral: true,
        });
    }
}
