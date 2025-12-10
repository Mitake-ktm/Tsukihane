import { GuildMember, PermissionResolvable } from 'discord.js';
import { config } from '../config/config';

export function hasPermissions(member: GuildMember, permissions: PermissionResolvable[]): boolean {
    return permissions.every(permission => member.permissions.has(permission));
}

export function isOwner(userId: string): boolean {
    return userId === config.ownerId;
}

export function isModerator(member: GuildMember): boolean {
    return hasPermissions(member, config.permissions.moderation);
}

export function isAdmin(member: GuildMember): boolean {
    return hasPermissions(member, config.permissions.admin);
}

export function canModerate(moderator: GuildMember, target: GuildMember): boolean {
    // Can't moderate yourself
    if (moderator.id === target.id) return false;

    // Can't moderate the server owner
    if (target.id === target.guild.ownerId) return false;

    // Check role hierarchy
    return moderator.roles.highest.position > target.roles.highest.position;
}
