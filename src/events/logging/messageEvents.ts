import { Message, PartialMessage, AuditLogEvent, TextChannel, User, EmbedBuilder } from 'discord.js';
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

        // Custom Embed Construction for "Message Deleted"
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Deleted')
            .setDescription(content)
            .setColor(config.colors.error)
            .setTimestamp();

        // 1. Author field (Author Name + Avatar in Author slot)
        if (user && 'username' in user) {
            embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
        } else {
            embed.setAuthor({ name: 'Utilisateur Inconnu' });
        }

        // 2. Message Date
        // Format: 17 décembre 2025 13:30 (il y a une minute)
        // Use discord.js time formatting
        const createdTimestamp = Math.floor(message.createdTimestamp / 1000);
        embed.addFields({
            name: 'Message Date',
            value: `<t:${createdTimestamp}:f> (<t:${createdTimestamp}:R>)`,
            inline: false
        });

        // 3. IDs field
        // Message (ID)
        // # logs (ID)
        // @ User (ID)
        // Using blockquote syntax like in the image
        let idField = `> Message (${message.id})\n`;
        idField += `> ${message.channel} (${message.channel.id})\n`;
        if (user && 'id' in user) {
            idField += `> ${user} (${user.id})`;
        } else {
            idField += `> Utilisteur Inconnu`;
        }

        embed.addFields({ name: 'IDs', value: idField, inline: false });

        // Add Footer for executor info if known
        if (executor) {
            embed.setFooter({ text: `Supprimé par ${executor.tag}`, iconURL: executor.displayAvatarURL() });
        } else {
            embed.setFooter({ text: `Supprimé par inconnu ou auto-delete` });
        }

        await logEvent(message.guild.id, 'MESSAGE_DELETE', `Message de ${user} supprimé`, config.colors.error, {
            target: user as User || undefined,
            executor: (executor as User) || undefined,
            customEmbed: embed,
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
