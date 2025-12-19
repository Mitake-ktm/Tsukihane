import { Events, Message, TextChannel, Collection } from 'discord.js';
import { handleAutoModeration } from '../services/moderationService';
import { processMessage, handleLevelUp } from '../services/xpService';
import { config } from '../config/config';

export const name = Events.MessageCreate;
export const once = false;

const lastMikeTrigger = new Collection<string, number>();

export async function execute(message: Message): Promise<void> {
    // Ignore bots
    if (message.author.bot) return;

    // Ignore DMs
    if (!message.guild || !message.member) return;

    // Run auto-moderation
    const wasModerated = await handleAutoModeration(message);
    if (wasModerated) return;

    // Don't award XP for commands
    if (message.content.startsWith('/')) return;

    // Process XP
    const result = await processMessage(message.member, message.channel.id);
    if (result?.leveledUp) {
        await handleLevelUp(message.member, result.newLevel, message.channel as TextChannel);
    }

    // Handle keyword reactions
    await handleKeywordReactions(message);

    // Handle special mentions (Mike)
    await handleSpecialMentions(message);
}

async function handleKeywordReactions(message: Message): Promise<void> {
    const lowerContent = message.content.toLowerCase();

    for (const { keywords, emoji } of config.keywordReactions) {
        // Create regex for whole word matching
        // We use word boundaries \b to ensure we match "keyword" but not "keywordss" or "akeyword"
        const regexes = keywords.map(k => new RegExp(`\\b${k}\\b`, 'i'));

        if (regexes.some(regex => regex.test(lowerContent))) {
            await message.react(emoji).catch(() => { });
            break;
        }
    }
}

async function handleSpecialMentions(message: Message): Promise<void> {
    const { mike } = config.specialMentions;

    if (mike.enabled && message.content.toLowerCase().includes('mike')) {
        const now = Date.now();
        const cooldownAmount = 24 * 60 * 60 * 1000; // 24 hours
        const lastTrigger = lastMikeTrigger.get(message.author.id);

        if (lastTrigger && now - lastTrigger < cooldownAmount) {
            return;
        }

        const response = mike.responses[Math.floor(Math.random() * mike.responses.length)];
        await message.reply(response).catch(() => { });

        lastMikeTrigger.set(message.author.id, now);
    }
}
