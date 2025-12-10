import { Events, Message, TextChannel } from 'discord.js';
import { handleAutoModeration } from '../services/moderationService';
import { processMessage, handleLevelUp } from '../services/xpService';
import { config } from '../config/config';

export const name = Events.MessageCreate;
export const once = false;

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
        if (keywords.some(keyword => lowerContent.includes(keyword))) {
            await message.react(emoji).catch(() => { });
            break;
        }
    }
}

async function handleSpecialMentions(message: Message): Promise<void> {
    const { mike } = config.specialMentions;

    if (mike.enabled && message.content.toLowerCase().includes('mike')) {
        const response = mike.responses[Math.floor(Math.random() * mike.responses.length)];
        await message.reply(response).catch(() => { });
    }
}
