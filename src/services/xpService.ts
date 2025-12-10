import { GuildMember, TextChannel, User as DiscordUser } from 'discord.js';
import { User } from '../database/models';
import { config } from '../config/config';
import { levelUpEmbed } from '../utils/embed';

export async function getUser(userId: string, guildId: string): Promise<any> {
    let user = await User.findOne({ userId, guildId });

    if (!user) {
        user = await User.create({
            userId,
            guildId,
            xp: 0,
            level: 0,
            totalXp: 0,
            lastXpGain: 0,
            messageCount: 0
        });
    }

    return user;
}

export function calculateXpForLevel(level: number): number {
    const { base, exponent } = config.leveling.levelFormula;
    return Math.floor(base * Math.pow(level, exponent));
}

export function calculateLevel(totalXp: number): number {
    let level = 0;
    let xpRequired = 0;

    while (totalXp >= xpRequired + calculateXpForLevel(level + 1)) {
        xpRequired += calculateXpForLevel(level + 1);
        level++;
    }

    return level;
}

export function getXpForCurrentLevel(totalXp: number, level: number): number {
    let xpUsed = 0;
    for (let i = 1; i <= level; i++) {
        xpUsed += calculateXpForLevel(i);
    }
    return totalXp - xpUsed;
}

export async function processMessage(member: GuildMember, channelId: string): Promise<{ leveledUp: boolean; newLevel: number } | null> {
    if (!config.leveling.enabled) return null;

    const userId = member.id;
    const guildId = member.guild.id;
    const now = Date.now();

    const userData = await getUser(userId, guildId);

    // Check cooldown
    if (now - userData.lastXpGain < config.leveling.xpCooldown) {
        // Still increment message count
        await User.updateOne(
            { userId, guildId },
            { $inc: { messageCount: 1 } }
        );
        return null;
    }

    // Calculate XP to award
    const { min, max } = config.leveling.xpPerMessage;
    let xpGain = Math.floor(Math.random() * (max - min + 1)) + min;

    // Apply channel multiplier
    const multiplier = config.leveling.channelMultipliers[channelId] || 1;
    xpGain = Math.floor(xpGain * multiplier);

    // Update user
    const newTotalXp = userData.totalXp + xpGain;
    const newLevel = calculateLevel(newTotalXp);
    const newXp = getXpForCurrentLevel(newTotalXp, newLevel);

    await User.updateOne(
        { userId, guildId },
        {
            xp: newXp,
            level: newLevel,
            totalXp: newTotalXp,
            lastXpGain: now,
            $inc: { messageCount: 1 }
        }
    );

    // Check for level up
    if (newLevel > userData.level) {
        return { leveledUp: true, newLevel };
    }

    return null;
}

export async function handleLevelUp(member: GuildMember, newLevel: number, channel?: TextChannel): Promise<void> {
    // Send level-up message
    const embed = levelUpEmbed(member.user, newLevel);

    if (config.leveling.announceInChannel && channel) {
        await channel.send({ content: `${member}`, embeds: [embed] }).catch(() => { });
    } else {
        await member.send({ embeds: [embed] }).catch(() => { });
    }

    // Assign rank roles
    await assignRankRoles(member, newLevel);
}

export async function assignRankRoles(member: GuildMember, level: number): Promise<void> {
    const rankRoles = config.leveling.rankRoles;

    for (const [requiredLevel, roleData] of Object.entries(rankRoles)) {
        if (!roleData || !roleData.roleId) continue;

        const role = member.guild.roles.cache.get(roleData.roleId);
        if (!role) continue;

        if (level >= parseInt(requiredLevel)) {
            if (!member.roles.cache.has(roleData.roleId)) {
                await member.roles.add(role).catch(() => { });
            }
        }
    }
}

export async function getUserRank(userId: string, guildId: string): Promise<number> {
    const user = await User.findOne({ userId, guildId });
    if (!user) return 0;

    // Count users with more XP
    const count = await User.countDocuments({
        guildId,
        totalXp: { $gt: user.totalXp }
    });

    return count + 1;
}

export async function getLeaderboard(guildId: string, limit: number = 10, offset: number = 0): Promise<{ userId: string; level: number; totalXp: number }[]> {
    const users = await User.find({ guildId })
        .sort({ totalXp: -1 })
        .skip(offset)
        .limit(limit)
        .select('userId level totalXp');

    return users.map(u => ({ userId: u.userId, level: u.level, totalXp: u.totalXp }));
}

export async function getTotalUsers(guildId: string): Promise<number> {
    return await User.countDocuments({ guildId });
}

export async function setLevel(userId: string, guildId: string, level: number): Promise<void> {
    // Calculate total XP for this level
    let totalXp = 0;
    for (let i = 1; i <= level; i++) {
        totalXp += calculateXpForLevel(i);
    }

    await User.findOneAndUpdate(
        { userId, guildId },
        {
            xp: 0,
            level,
            totalXp,
            $setOnInsert: { messageCount: 0, lastXpGain: 0 }
        },
        { upsert: true, new: true }
    );
}

export async function addXp(userId: string, guildId: string, amount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
    const userData = await getUser(userId, guildId);
    const newTotalXp = userData.totalXp + amount;
    const newLevel = calculateLevel(newTotalXp);
    const newXp = getXpForCurrentLevel(newTotalXp, newLevel);

    await User.updateOne(
        { userId, guildId },
        { xp: newXp, level: newLevel, totalXp: newTotalXp }
    );

    return { newLevel, leveledUp: newLevel > userData.level };
}

export async function resetUser(userId: string, guildId: string): Promise<void> {
    await User.updateOne(
        { userId, guildId },
        { xp: 0, level: 0, totalXp: 0, messageCount: 0 }
    );
}

