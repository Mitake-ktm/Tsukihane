import { Message, PartialMessage, AuditLogEvent, TextChannel, User } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const messageDelete: BotEvent = {
    name: 'messageDelete',
    once: false,
    async execute(message: Message | PartialMessage) {
        if (!message.guild) return; // Keep bot allowed, remove message.author.bot check

        // Fetch audit logs to find executor
        let executor = null;
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 5, // Fetch a few more just in case
                type: AuditLogEvent.MessageDelete,
            });

            // Find a log entry that matches: target is message author, and created recently
            const deletionLog = fetchedLogs.entries.find(entry =>
                entry.target?.id === message.author?.id &&
                entry.extra.channel.id === message.channel.id &&
                (Date.now() - entry.createdTimestamp) < 20000 // 20 seconds margin
            );

            if (deletionLog) {
                executor = deletionLog.executor;
            } else {
                // If no audit log found:
                // 1. If it's a user message, they likely deleted it themselves
                // 2. If it's a bot message, it might be an auto-delete or API action (unknown executor)
                if (message.author && !message.author.bot) {
                    executor = message.author;
                }
            }
        } catch (e) { }

        if (message.webhookId) return; // Still ignore webhooks

        let user = message.author;
        if (user && 'partial' in user && user.partial) {
            try {
                user = await user.fetch();
            } catch (e) {
                // user left or invalid
            }
        }

        const content = message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + '...' : message.content) : '*Pas de contenu (image/embed)*';

        // Custom description based on executor
        let description = `**Message supprimé** dans <#${message.channel.id}>\n\n**Contenu** :\n${content}`;

        if (executor) {
            if (executor.id === message.author?.id) {
                description += `\n\n**Supprimé par l'auteur** (${executor})`;
            } else {
                description += `\n\n**Supprimé par** : ${executor} (\`${executor.id}\`)`;
            }
        } else {
            description += `\n\n**Supprimé par** : *Inconnu (possiblement l'auteur ou auto-delete)*`;
        }

        await logEvent(message.guild.id, 'MESSAGE_DELETE', description, config.colors.error, {
            target: user as User || undefined,
            executor: (executor as User) || undefined,
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
