import { Client, TextChannel, EmbedBuilder, User } from 'discord.js';
import { config } from '../config/config';
import { moderationEmbed } from '../utils/embed';

let client: Client;

export function initLoggingService(botClient: Client): void {
    client = botClient;
    console.log('📝 Logging service initialized');
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
