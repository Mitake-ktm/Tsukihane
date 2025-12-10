import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { config } from '../../config/config';
import { getUser } from '../../services/xpService';

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Afficher les informations d\'un utilisateur / Display user information')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('L\'utilisateur à inspecter')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id) as GuildMember | undefined;

    // Get user level data if exists
    let levelData = null;
    try {
        levelData = await getUser(user.id, interaction.guild!.id);
    } catch {
        // User might not have level data
    }

    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedAt = member?.joinedTimestamp
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
        : 'N/A';

    // Calculate badges/achievements
    const badges: string[] = [];
    if (user.bot) badges.push('🤖 Bot');
    if (member?.premiumSince) badges.push('💎 Booster');
    if (user.id === interaction.guild?.ownerId) badges.push('👑 Propriétaire');
    if (levelData && levelData.level >= 50) badges.push('⭐ Vétéran');
    if (levelData && levelData.level >= 100) badges.push('🔴 Entity');

    const embed = new EmbedBuilder()
        .setTitle(`👤 ${user.displayName}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setColor(member?.displayColor || config.colors.primary)
        .addFields(
            { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
            { name: '📛 Tag', value: user.tag, inline: true },
            { name: '📅 Compte créé', value: createdAt, inline: true },
            { name: '📥 A rejoint', value: joinedAt, inline: true },
            {
                name: '🎭 Rôles',
                value: member?.roles.cache
                    .filter(r => r.id !== interaction.guild?.id)
                    .sort((a, b) => b.position - a.position)
                    .first(5)
                    ?.map(r => r.toString())
                    .join(', ') || 'Aucun',
                inline: false
            }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    // Add level info if available
    if (levelData) {
        embed.addFields(
            { name: '📊 Niveau', value: `${levelData.level}`, inline: true },
            { name: '✨ XP', value: `${levelData.xp.toLocaleString()}`, inline: true },
            { name: '💬 Messages', value: `${levelData.messageCount?.toLocaleString() || 'N/A'}`, inline: true }
        );
    }

    // Add badges if any
    if (badges.length > 0) {
        embed.addFields({ name: '🏅 Badges', value: badges.join(' • '), inline: false });
    }

    await interaction.reply({ embeds: [embed] });
}
