import { Client, TextChannel, EmbedBuilder, User } from 'discord.js';
import { config } from '../config/config';
import { moderationEmbed } from '../utils/embed';

let client: Client;

export function initLoggingService(botClient: Client): void {
    client = botClient;
    console.log('📝 Logging service initialized');
}

import ServerLog from '../database/models/ServerLog';

export type LogType =
    | 'MESSAGE_DELETE' | 'MESSAGE_UPDATE' | 'MESSAGE_BULK_DELETE'
    | 'CHANNEL_CREATE' | 'CHANNEL_DELETE' | 'CHANNEL_UPDATE'
    | 'ROLE_CREATE' | 'ROLE_DELETE' | 'ROLE_UPDATE'
    | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'MEMBER_UPDATE' | 'MEMBER_BAN' | 'MEMBER_UNBAN' | 'MEMBER_KICK'
    | 'VOICE_JOIN' | 'VOICE_LEAVE' | 'VOICE_MOVE'
    | 'GUILD_UPDATE' | 'INVITE_CREATE' | 'INVITE_DELETE'
    | 'MODERATION_ACTION';

interface LogOptions {
    executor?: User;
    target?: User | { id: string; tag?: string };
    reason?: string;
    extra?: any;
}

export async function logEvent(
    guildId: string,
    type: LogType,
    description: string,
    color: number,
    options: LogOptions = {}
): Promise<void> {
    try {
        // 1. Save to Database
        await ServerLog.create({
            guildId,
            type,
            executorId: options.executor?.id,
            targetId: options.target && 'id' in options.target ? options.target.id : undefined,
            details: {
                description,
                reason: options.reason,
                ...options.extra
            }
        });

        // 2. Send to Discord Channel
        if (!config.channels.serverLogs) return;

        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(config.channels.serverLogs) as TextChannel;

        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`📝 Log: ${type.replace(/_/g, ' ')}`)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            if (options.executor) {
                embed.addFields({ name: 'Exécuté par', value: `${options.executor} (\`${options.executor.id}\`)`, inline: true });
            }

            if (options.target) {
                const targetVal = 'tag' in options.target ? `${options.target.tag} (\`${options.target.id}\`)` : `<@${options.target.id}>`;
                embed.addFields({ name: 'Cible', value: targetVal, inline: true });
            }

            if (options.reason) {
                embed.addFields({ name: 'Raison', value: options.reason, inline: false });
            }

            // Add extra fields if they are simple key-value pairs appropriate for embed
            if (options.extra) {
                const extraFields = Object.entries(options.extra)
                    .filter(([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
                    .slice(0, 5) // Limit to avoid hitting embed limits
                    .map(([k, v]) => ({ name: k, value: String(v), inline: true }));

                if (extraFields.length > 0) {
                    embed.addFields(extraFields);
                }
            }

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(`Failed to log event ${type}:`, error);
    }
}

export async function logToChannel(
    guildId: string,
    embed: EmbedBuilder
): Promise<void> {
    if (!config.channels.moderationLogs) return;

    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(config.channels.moderationLogs) as TextChannel;

        if (channel) {
            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Failed to log to channel:', error);
    }
}

export async function logModeration(
    guildId: string,
    action: string,
    user: User,
    moderator: User,
    reason: string,
    details?: string
): Promise<void> {
    const embed = moderationEmbed(action, user, moderator, reason, details);
    await logToChannel(guildId, embed);
}

export async function logBan(guildId: string, user: User, moderator: User, reason: string): Promise<void> {
    await logModeration(guildId, 'Bannissement', user, moderator, reason);
}

export async function logKick(guildId: string, user: User, moderator: User, reason: string): Promise<void> {
    await logModeration(guildId, 'Expulsion', user, moderator, reason);
}

export async function logMute(guildId: string, user: User, moderator: User, reason: string, duration: string): Promise<void> {
    await logModeration(guildId, 'Mute', user, moderator, reason, `Durée: ${duration}`);
}

export async function logUnmute(guildId: string, user: User, moderator: User): Promise<void> {
    await logModeration(guildId, 'Unmute', user, moderator, 'Mute levé');
}

export async function logWarn(guildId: string, user: User, moderator: User, reason: string, warningCount: number): Promise<void> {
    await logModeration(guildId, 'Avertissement', user, moderator, reason, `Total: ${warningCount} avertissement(s)`);
}

export async function logClear(guildId: string, moderator: User, channel: TextChannel, count: number): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle('🧹 Messages Supprimés')
        .setColor(config.colors.info)
        .addFields(
            { name: 'Canal', value: `${channel}`, inline: true },
            { name: 'Quantité', value: `${count} messages`, inline: true },
            { name: 'Modérateur', value: `${moderator.tag}`, inline: true }
        )
        .setTimestamp();

    await logToChannel(channel.guild.id, embed);
}
