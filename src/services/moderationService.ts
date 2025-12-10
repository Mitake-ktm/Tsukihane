import { Message, TextChannel } from 'discord.js';
import { Warning, Blacklist, ModLog } from '../database/models';
import { config } from '../config/config';

interface SpamTracker {
    messages: number[];
    lastContent: string;
    duplicateCount: number;
}

const spamTrackers = new Map<string, SpamTracker>();

export async function checkBlacklist(content: string, guildId: string): Promise<string | null> {
    const lowerContent = content.toLowerCase();

    // Check config blacklist
    for (const word of config.moderation.blacklist) {
        if (lowerContent.includes(word.toLowerCase())) {
            return word;
        }
    }

    // Check database blacklist
    const blacklistedWords = await Blacklist.find({ guildId });

    for (const { word } of blacklistedWords) {
        if (lowerContent.includes(word.toLowerCase())) {
            return word;
        }
    }

    return null;
}

export function checkSpam(message: Message): boolean {
    if (!config.moderation.antiSpam.enabled) return false;

    const userId = message.author.id;
    const now = Date.now();
    const { messageLimit, timeWindow, duplicateLimit } = config.moderation.antiSpam;

    let tracker = spamTrackers.get(userId);

    if (!tracker) {
        tracker = {
            messages: [now],
            lastContent: message.content,
            duplicateCount: 1,
        };
        spamTrackers.set(userId, tracker);
        return false;
    }

    // Clean old timestamps
    tracker.messages = tracker.messages.filter(t => now - t < timeWindow);
    tracker.messages.push(now);

    // Check duplicate messages
    if (message.content === tracker.lastContent) {
        tracker.duplicateCount++;
        if (tracker.duplicateCount >= duplicateLimit) {
            return true;
        }
    } else {
        tracker.lastContent = message.content;
        tracker.duplicateCount = 1;
    }

    // Check message flood
    if (tracker.messages.length >= messageLimit) {
        return true;
    }

    return false;
}

export function checkCapsAbuse(content: string): boolean {
    if (!config.moderation.capsDetection.enabled) return false;

    const { threshold, minLength } = config.moderation.capsDetection;

    // Remove non-letter characters for accurate calculation
    const letters = content.replace(/[^a-zA-Z]/g, '');

    if (letters.length < minLength) return false;

    const upperCount = (letters.match(/[A-Z]/g) || []).length;
    const capsRatio = upperCount / letters.length;

    return capsRatio >= threshold;
}

export async function handleAutoModeration(message: Message): Promise<boolean> {
    if (!message.guild || message.author.bot) return false;
    if (message.member?.permissions.has('ModerateMembers')) return false;

    const channel = message.channel as TextChannel;

    // Check blacklist
    const blacklistedWord = await checkBlacklist(message.content, message.guild.id);
    if (blacklistedWord) {
        await message.delete().catch(() => { });
        await channel.send({
            content: `⚠️ ${message.author}, ton message contenait un mot interdit.`,
        }).then((msg: Message) => setTimeout(() => msg.delete().catch(() => { }), 5000));
        await logModAction(message.guild.id, message.author.id, 'SYSTEM', 'AUTO_DELETE', `Mot interdit: ${blacklistedWord}`);
        return true;
    }

    // Check spam
    if (checkSpam(message)) {
        await message.delete().catch(() => { });
        await channel.send({
            content: `⚠️ ${message.author}, merci de ne pas spammer.`,
        }).then((msg: Message) => setTimeout(() => msg.delete().catch(() => { }), 5000));
        await logModAction(message.guild.id, message.author.id, 'SYSTEM', 'AUTO_DELETE', 'Spam détecté');
        return true;
    }

    // Check caps abuse
    if (checkCapsAbuse(message.content)) {
        await message.delete().catch(() => { });
        await channel.send({
            content: `⚠️ ${message.author}, merci de ne pas abuser des majuscules.`,
        }).then((msg: Message) => setTimeout(() => msg.delete().catch(() => { }), 5000));
        await logModAction(message.guild.id, message.author.id, 'SYSTEM', 'AUTO_DELETE', 'Abus de majuscules');
        return true;
    }

    return false;
}

export async function addToBlacklist(guildId: string, word: string, addedBy: string): Promise<boolean> {
    try {
        await Blacklist.create({ guildId, word: word.toLowerCase(), addedBy });
        return true;
    } catch {
        return false;
    }
}

export async function removeFromBlacklist(guildId: string, word: string): Promise<boolean> {
    try {
        const result = await Blacklist.deleteOne({ guildId, word: word.toLowerCase() });
        return result.deletedCount > 0;
    } catch {
        return false;
    }
}

export async function getBlacklist(guildId: string): Promise<string[]> {
    const rows = await Blacklist.find({ guildId });
    return [...config.moderation.blacklist, ...rows.map(r => r.word)];
}

export async function logModAction(
    guildId: string,
    userId: string,
    moderatorId: string,
    action: string,
    reason?: string,
    details?: string
): Promise<void> {
    await ModLog.create({
        guildId,
        userId,
        moderatorId,
        action,
        reason: reason,
        details: details
    });
}

export async function addWarning(guildId: string, userId: string, moderatorId: string, reason: string): Promise<any> {
    const warning = await Warning.create({
        userId,
        guildId,
        moderatorId,
        reason
    });
    return warning;
}

export async function getWarnings(guildId: string, userId: string): Promise<{ id: string; reason: string; moderatorId: string; createdAt: number }[]> {
    const warnings = await Warning.find({ guildId, userId }).sort({ createdAt: -1 });

    return warnings.map(w => ({
        id: (w._id as any).toString(), // Mongoose virtual getter for _id string
        reason: w.reason,
        moderatorId: w.moderatorId,
        createdAt: Math.floor(w.createdAt.getTime() / 1000)
    }));
}

export async function clearWarnings(guildId: string, userId: string): Promise<number> {
    const result = await Warning.deleteMany({ guildId, userId });
    return result.deletedCount;
}

