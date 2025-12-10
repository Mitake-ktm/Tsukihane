import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { addWarning, getWarnings } from '../../services/moderationService';
import { logWarn } from '../../services/loggingService';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un utilisateur')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à avertir")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('raison')
            .setDescription("Raison de l'avertissement")
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);
    const reason = interaction.options.getString('raison', true);

    if (target.bot) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Tu ne peux pas avertir un bot.")],
            ephemeral: true,
        });
        return;
    }

    if (target.id === interaction.user.id) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', "Tu ne peux pas t'avertir toi-même.")],
            ephemeral: true,
        });
        return;
    }

    const warningId = await addWarning(interaction.guild!.id, target.id, interaction.user.id, reason);
    const allWarnings = await getWarnings(interaction.guild!.id, target.id);

    await interaction.reply({
        embeds: [successEmbed('Avertissement', `**${target.tag}** a reçu un avertissement.\n**Raison:** ${reason}\n**Total:** ${allWarnings.length} avertissement(s)`)],
    });

    // Try to DM the user
    try {
        const dmEmbed = new EmbedBuilder()
            .setTitle('⚠️ Avertissement')
            .setDescription(`Tu as reçu un avertissement sur **${interaction.guild!.name}**.`)
            .addFields(
                { name: 'Raison', value: reason },
                { name: 'Total', value: `${allWarnings.length} avertissement(s)` }
            )
            .setColor(config.colors.warning)
            .setTimestamp();

        await target.send({ embeds: [dmEmbed] });
    } catch {
        // User has DMs disabled
    }

    await logWarn(interaction.guild!.id, target, interaction.user, reason, allWarnings.length);
}
