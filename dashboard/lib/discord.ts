import { Guild } from './types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Fetch user's guilds from Discord API
 */
export async function fetchUserGuilds(accessToken: string): Promise<Guild[]> {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch guilds');
    }

    return response.json();
}

/**
 * Check if user has "Manage Server" permission in a guild
 * Permission bit for MANAGE_GUILD is 0x20 (32)
 */
export function hasManagePermission(permissions: string): boolean {
    const permissionsBigInt = BigInt(permissions);
    const MANAGE_GUILD = BigInt(0x20);
    const ADMINISTRATOR = BigInt(0x8);

    return (permissionsBigInt & MANAGE_GUILD) === MANAGE_GUILD ||
        (permissionsBigInt & ADMINISTRATOR) === ADMINISTRATOR;
}

/**
 * Filter guilds where user has manage permission
 */
export function filterManageableGuilds(guilds: Guild[]): Guild[] {
    return guilds.filter((guild) => hasManagePermission(guild.permissions));
}

/**
 * Generate Discord avatar URL
 */
export function getAvatarUrl(userId: string, avatar: string | null, discriminator?: string): string {
    if (avatar) {
        const extension = avatar.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${extension}`;
    }

    // Default avatar
    const defaultIndex = discriminator
        ? parseInt(discriminator) % 5
        : (BigInt(userId) >> BigInt(22)) % BigInt(6);
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

/**
 * Generate Discord guild icon URL
 */
export function getGuildIconUrl(guildId: string, icon: string | null, size = 128): string {
    if (icon) {
        const extension = icon.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${extension}?size=${size}`;
    }
    return '';
}

/**
 * Get guild's initials for placeholder icon
 */
export function getGuildInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

/**
 * Fetch guild channels from Discord API (requires bot token)
 */
export async function fetchGuildChannels(guildId: string): Promise<unknown[]> {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
        headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
    });

    if (!response.ok) {
        return [];
    }

    return response.json();
}

/**
 * Fetch guild roles from Discord API (requires bot token)
 */
export async function fetchGuildRoles(guildId: string): Promise<unknown[]> {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
        headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
    });

    if (!response.ok) {
        return [];
    }

    return response.json();
}

/**
 * Send a message to a channel (requires bot token)
 */
export async function sendChannelMessage(
    channelId: string,
    content: string,
    embed?: object
): Promise<boolean> {
    const body: { content?: string; embeds?: object[] } = {};

    if (content) body.content = content;
    if (embed) body.embeds = [embed];

    const response = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    return response.ok;
}
