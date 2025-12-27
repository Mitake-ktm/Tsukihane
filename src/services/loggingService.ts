import { Client, TextChannel, EmbedBuilder, User } from 'discord.js';
import { config } from '../config/config';
import { moderationEmbed } from '../utils/embed';
import ServerLog, {
    ServerLogType,
    LogCategory,
    LogSeverity,
    IServerLog,
    getCategoryFromType,
    getSeverityFromType
} from '../database/models/ServerLog';

let client: Client;

export function initLoggingService(botClient: Client): void {
    client = botClient;
    console.log('📝 Logging service initialized');
}

// Re-export types for use elsewhere
export type { ServerLogType, LogCategory, LogSeverity };

interface LogOptions {
    executor?: User;
    target?: User | { id: string; tag?: string };
    channelId?: string;
    channelName?: string;
    reason?: string;
    extra?: Record<string, any>;
    customEmbed?: EmbedBuilder;
    severity?: LogSeverity;
}

/**
 * Log an event to both database and Discord channel
 */
export async function logEvent(
    guildId: string,
    type: ServerLogType,
    description: string,
    color: number,
    options: LogOptions = {}
): Promise<void> {
    try {
        const category = getCategoryFromType(type);
        const severity = options.severity || getSeverityFromType(type);

        // 1. Save to Database with enhanced schema
        await ServerLog.create({
            guildId,
            type,
            category,
            severity,
            executorId: options.executor?.id,
            executorTag: options.executor?.tag,
            targetId: options.target && 'id' in options.target ? options.target.id : undefined,
            targetTag: options.target && 'tag' in options.target ? options.target.tag : undefined,
            channelId: options.channelId,
            channelName: options.channelName,
            description,
            details: {
                reason: options.reason,
                ...options.extra
            }
        });

        // 2. Send to Discord Channel
        if (!config.channels.serverLogs) return;

        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(config.channels.serverLogs) as TextChannel;

        if (channel) {
            let embed: EmbedBuilder;

            if (options.customEmbed) {
                embed = options.customEmbed;
                if (!embed.data.timestamp) embed.setTimestamp();
                if (!embed.data.color) embed.setColor(color);
            } else {
                embed = new EmbedBuilder()
                    .setTitle(`📝 Log: ${type.replace(/_/g, ' ')}`)
                    .setDescription(description)
                    .setColor(color)
                    .setTimestamp();
            }

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

            if (options.extra) {
                const extraFields = Object.entries(options.extra)
                    .filter(([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
                    .slice(0, 5)
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

// ============================================
// LOG SEARCH AND FILTER FUNCTIONALITY
// ============================================

export interface LogSearchFilters {
    guildId: string;
    types?: ServerLogType[];
    categories?: LogCategory[];
    severities?: LogSeverity[];
    executorId?: string;
    targetId?: string;
    channelId?: string;
    searchText?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface LogSearchOptions {
    limit?: number;
    offset?: number;
    sortOrder?: 'asc' | 'desc';
}

export interface LogSearchResult {
    logs: IServerLog[];
    total: number;
    page: number;
    totalPages: number;
}

/**
 * Search and filter logs with advanced options
 */
export async function searchLogs(
    filters: LogSearchFilters,
    options: LogSearchOptions = {}
): Promise<LogSearchResult> {
    const { limit = 25, offset = 0, sortOrder = 'desc' } = options;

    // Build query
    const query: any = { guildId: filters.guildId };

    if (filters.types && filters.types.length > 0) {
        query.type = { $in: filters.types };
    }

    if (filters.categories && filters.categories.length > 0) {
        query.category = { $in: filters.categories };
    }

    if (filters.severities && filters.severities.length > 0) {
        query.severity = { $in: filters.severities };
    }

    if (filters.executorId) {
        query.executorId = filters.executorId;
    }

    if (filters.targetId) {
        query.targetId = filters.targetId;
    }

    if (filters.channelId) {
        query.channelId = filters.channelId;
    }

    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
            query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
            query.createdAt.$lte = filters.endDate;
        }
    }

    if (filters.searchText) {
        query.$text = { $search: filters.searchText };
    }

    // Execute count and find in parallel
    const [total, logs] = await Promise.all([
        ServerLog.countDocuments(query),
        ServerLog.find(query)
            .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
            .skip(offset)
            .limit(limit)
            .lean()
    ]);

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return { logs: logs as IServerLog[], total, page, totalPages };
}

/**
 * Get recent logs for a guild
 */
export async function getRecentLogs(
    guildId: string,
    limit: number = 50
): Promise<IServerLog[]> {
    return await ServerLog.find({ guildId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean() as IServerLog[];
}

/**
 * Get logs for a specific user (as executor or target)
 */
export async function getLogsForUser(
    guildId: string,
    userId: string,
    limit: number = 50
): Promise<IServerLog[]> {
    return await ServerLog.find({
        guildId,
        $or: [{ executorId: userId }, { targetId: userId }]
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean() as IServerLog[];
}

/**
 * Get logs by category
 */
export async function getLogsByCategory(
    guildId: string,
    category: LogCategory,
    limit: number = 50
): Promise<IServerLog[]> {
    return await ServerLog.find({ guildId, category })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean() as IServerLog[];
}

/**
 * Get log statistics for a guild
 */
export async function getLogStats(
    guildId: string,
    days: number = 7
): Promise<{
    totalLogs: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    topTypes: { type: string; count: number }[];
}> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLogs, byCategory, bySeverity, topTypes] = await Promise.all([
        ServerLog.countDocuments({ guildId, createdAt: { $gte: startDate } }),
        ServerLog.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        ServerLog.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        ServerLog.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    ]);

    return {
        totalLogs,
        byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
        bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
        topTypes: topTypes.map(t => ({ type: t._id, count: t.count }))
    };
}

/**
 * Delete old logs (for log retention)
 */
export async function deleteOldLogs(
    guildId: string,
    daysToKeep: number = 30
): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ServerLog.deleteMany({
        guildId,
        createdAt: { $lt: cutoffDate }
    });

    return result.deletedCount;
}

// ============================================
// MODERATION SPECIFIC LOGGING (KEPT FOR COMPATIBILITY)
// ============================================

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
