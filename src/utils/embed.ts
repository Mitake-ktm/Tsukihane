import { EmbedBuilder, User, ColorResolvable } from 'discord.js';
import { config } from '../config/config';

export function createEmbed(
    title: string,
    description: string,
    color: ColorResolvable = config.colors.primary
): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

export function successEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed(title, description, config.colors.success);
}

export function errorEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed(title, description, config.colors.error);
}

export function warningEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed(title, description, config.colors.warning);
}

export function infoEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed(title, description, config.colors.info);
}

export function levelUpEmbed(user: User, newLevel: number): EmbedBuilder {
    const messages = [
        `🎉 Félicitations ! Tu viens d'atteindre le niveau **${newLevel}** !`,
        `🚀 Incroyable ! Tu es maintenant niveau **${newLevel}** !`,
        `⭐ Bravo ! Tu as grimpé au niveau **${newLevel}** !`,
        `🏆 Excellent travail ! Niveau **${newLevel}** atteint !`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return new EmbedBuilder()
        .setTitle('🎊 Niveau Supérieur !')
        .setDescription(randomMessage)
        .setColor(config.colors.levelUp)
        .setThumbnail(user.displayAvatarURL({ size: 128 }))
        .setFooter({ text: `Continue comme ça, ${user.username} !` })
        .setTimestamp();
}

export function moderationEmbed(
    action: string,
    user: User,
    moderator: User,
    reason: string,
    details?: string
): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(`🔨 ${action}`)
        .setColor(config.colors.warning)
        .addFields(
            { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Modérateur', value: `${moderator.tag}`, inline: true },
            { name: 'Raison', value: reason || 'Aucune raison fournie' }
        )
        .setThumbnail(user.displayAvatarURL({ size: 64 }))
        .setTimestamp();

    if (details) {
        embed.addFields({ name: 'Détails', value: details });
    }

    return embed;
}

export function leaderboardEmbed(
    entries: { rank: number; userId: string; level: number; totalXp: number }[],
    page: number,
    totalPages: number
): EmbedBuilder {
    const description = entries
        .map((entry) => {
            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `**#${entry.rank}**`;
            return `${medal} <@${entry.userId}> - Niveau ${entry.level} (${entry.totalXp.toLocaleString()} XP)`;
        })
        .join('\n');

    return new EmbedBuilder()
        .setTitle('🏆 Classement du Serveur')
        .setDescription(description || 'Aucun utilisateur trouvé.')
        .setColor(config.colors.primary)
        .setFooter({ text: `Page ${page}/${totalPages}` })
        .setTimestamp();
}

export function profileEmbed(
    user: User,
    data: {
        level: number;
        xp: number;
        totalXp: number;
        xpForNextLevel: number;
        rank: number;
        messageCount: number;
    }
): EmbedBuilder {
    const progressBar = createProgressBar(data.xp, data.xpForNextLevel);

    return new EmbedBuilder()
        .setTitle(`📊 Profil de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setColor(config.colors.primary)
        .addFields(
            { name: '🎖️ Niveau', value: `${data.level}`, inline: true },
            { name: '🏆 Rang', value: `#${data.rank}`, inline: true },
            { name: '💬 Messages', value: `${data.messageCount.toLocaleString()}`, inline: true },
            { name: '✨ XP Total', value: `${data.totalXp.toLocaleString()}`, inline: true },
            { name: '📈 Progression', value: `${data.xp} / ${data.xpForNextLevel} XP\n${progressBar}` }
        )
        .setTimestamp();
}

function createProgressBar(current: number, max: number, length: number = 10): string {
    const progress = Math.min(Math.floor((current / max) * length), length);
    const filled = '█'.repeat(progress);
    const empty = '░'.repeat(length - progress);
    const percentage = Math.floor((current / max) * 100);
    return `${filled}${empty} ${percentage}%`;
}
