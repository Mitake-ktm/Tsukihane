import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { errorEmbed } from '../../utils/embed';
import { getWarnings, clearWarnings } from '../../services/moderationService';
import { config } from '../../config/config';
import { formatRelativeTime } from '../../utils/time';

export const data = new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("Voir les avertissements d'un utilisateur")
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription("L'utilisateur à vérifier")
            .setRequired(true)
    )
    .addBooleanOption(option =>
        option
            .setName('effacer')
            .setDescription('Effacer tous les avertissements')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export const permissions = [PermissionFlagsBits.ModerateMembers];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur', true);
    const clear = interaction.options.getBoolean('effacer') || false;

    if (clear) {
        const count = await clearWarnings(interaction.guild!.id, target.id);
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🧹 Avertissements Effacés')
                    .setDescription(`${count} avertissement(s) effacé(s) pour **${target.tag}**.`)
                    .setColor(config.colors.success)
                    .setTimestamp()
            ],
        });
        return;
    }

    const warnings = await getWarnings(interaction.guild!.id, target.id);

    if (warnings.length === 0) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📋 Avertissements de ${target.tag}`)
                    .setDescription("Cet utilisateur n'a aucun avertissement.")
                    .setColor(config.colors.success)
                    .setThumbnail(target.displayAvatarURL({ size: 64 }))
                    .setTimestamp()
            ],
        });
        return;
    }

    const warningList = warnings.slice(0, 10).map((w, i) => {
        const date = formatRelativeTime(w.createdAt * 1000);
        return `**${i + 1}.** ${w.reason}\n   └ ${date} par <@${w.moderatorId}>`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
        .setTitle(`📋 Avertissements de ${target.tag}`)
        .setDescription(warningList)
        .setColor(config.colors.warning)
        .setThumbnail(target.displayAvatarURL({ size: 64 }))
        .setFooter({ text: `Total: ${warnings.length} avertissement(s)` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
