import { Message, PartialMessage, AuditLogEvent, TextChannel, User } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const messageDelete: BotEvent = {
    name: 'messageDelete',
    once: false,
    async execute(message: Message | PartialMessage) {
        if (!message.guild || message.author?.bot) return;

        // Fetch audit logs to find executor (optional, might be unreliable for old messages)
        let executor = null;
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });
            const deletionLog = fetchedLogs.entries.first();

            // Allow 5 seconds margin
            if (deletionLog && (Date.now() - deletionLog.createdTimestamp) < 5000 && deletionLog.target?.id === message.author?.id) {
                executor = deletionLog.executor;
            }
        } catch (e) { }

        if (message.webhookId) return; // Ignore webhooks

        let user = message.author;
        if (user && 'partial' in user && user.partial) {
            try {
                user = await user.fetch();
            } catch (e) {
                // user left or invalid
            }
        }

        const content = message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + '...' : message.content) : '*Pas de contenu (image/embed)*';

        await logEvent(message.guild.id, 'MESSAGE_DELETE', `**Message supprimé** dans <#${message.channel.id}>\n\n**Contenu** :\n${content}`, config.colors.error, {
            target: user as User || undefined,
            executor: executor || undefined,
            extra: {
                channel: (message.channel as TextChannel).name,
                messageId: message.id
            }
        });
    }
};

const messageUpdate: BotEvent = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return; // Embed update or similar

        const oldContent = oldMessage.content ? (oldMessage.content.length > 500 ? oldMessage.content.substring(0, 500) + '...' : oldMessage.content) : '*Vide*';
        const newContent = newMessage.content ? (newMessage.content.length > 500 ? newMessage.content.substring(0, 500) + '...' : newMessage.content) : '*Vide*';

        const author = newMessage.author as User;

        await logEvent(newMessage.guild!.id, 'MESSAGE_UPDATE', `**Message modifié** dans <#${newMessage.channel.id}> [Lien](${newMessage.url})\n\n**Avant** :\n${oldContent}\n\n**Après** :\n${newContent}`, config.colors.warning, {
            target: author || undefined,
            extra: {
                channel: (newMessage.channel as TextChannel).name,
                messageId: newMessage.id
            }
        });
    }
};

export const messageEvents = [messageDelete, messageUpdate];
