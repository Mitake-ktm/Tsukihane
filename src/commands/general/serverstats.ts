import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';
import { getLeaderboard } from '../../services/xpService';

export const data = new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Afficher les statistiques du serveur / Display server statistics');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const guild = interaction.guild!;

    // Get member count
    const memberCount = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = memberCount - botCount;

    // Get leveling stats
    const leaderboard = await getLeaderboard(guild.id, 10);
    const totalXP = leaderboard.reduce((acc: number, user: { totalXp: number }) => acc + user.totalXp, 0);
    const totalMessages = 0; // Messages tracked separately

    // Get most active members
    const topMembers = leaderboard.slice(0, 5).map((user: { userId: string; level: number; totalXp: number }, index: number) => {
        const member = guild.members.cache.get(user.userId);
        const name = member?.displayName || 'Utilisateur inconnu';
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        return `${medals[index]} **${name}** — Nv.${user.level} (${user.totalXp.toLocaleString()} XP)`;
    });

    const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques de ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }) || '')
        .setColor(config.colors.primary)
        .addFields(
            {
                name: '👥 Membres',
                value: `Total: **${memberCount}**\n👤 Humains: **${humanCount}**\n🤖 Bots: **${botCount}**`,
                inline: true
            },
            {
                name: '📈 Activité',
                value: `✨ XP total: **${totalXP.toLocaleString()}**\n💬 Messages: **${totalMessages.toLocaleString()}**`,
                inline: true
            },
            {
                name: '🏆 Top Membres Actifs',
                value: topMembers.length > 0 ? topMembers.join('\n') : 'Aucune donnée',
                inline: false
            }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
