import { Events, MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { config } from '../config/config';

export const name = Events.MessageReactionRemove;
export const once = false;

export async function execute(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
): Promise<void> {
    // Ignore bots
    if (user.bot) return;

    // Fetch partial data if needed
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch {
            return;
        }
    }

    if (!config.reactionRoles.enabled) return;

    const messageId = reaction.message.id;
    const emoji = reaction.emoji.name || reaction.emoji.id || '';

    // Check if this message has reaction roles configured
    const messageConfig = config.reactionRoles.messages[messageId];
    if (!messageConfig) return;

    const roleId = messageConfig[emoji];
    if (!roleId) return;

    // Get the guild member
    const guild = reaction.message.guild;
    if (!guild) return;

    try {
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);

        if (role && member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            console.log(`Removed role ${role.name} from ${member.user.tag}`);
        }
    } catch (error) {
        console.error('Error removing reaction role:', error);
    }
}
