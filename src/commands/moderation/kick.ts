import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { canModerate } from '../../utils/permissions';
import { logKick } from '../../services/loggingService';
import { logModAction } from '../../services/moderationService';

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un utilisateur du serveur')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à expulser")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('raison')
            .setDescription("Raison de l'expulsion")
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export const permissions = [PermissionFlagsBits.KickMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

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
            embeds: [errorEmbed('Erreur', "Tu ne peux pas expulser cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    if (!member.kickable) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Je ne peux pas expulser cet utilisateur.")],
            ephemeral: true,
        });
        return;
    }

    try {
        await member.kick(reason);

        await interaction.reply({
            embeds: [successEmbed('Utilisateur Expulsé', `**${target.tag}** a été expulsé.\n**Raison:** ${reason}`)],
        });

        await logKick(interaction.guild!.id, target, interaction.user, reason);
        logModAction(interaction.guild!.id, target.id, interaction.user.id, 'KICK', reason);
    } catch (error) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Une erreur s'est produite lors de l'expulsion.")],
            ephemeral: true,
        });
    }
}
