import { GuildMember, User, PartialGuildMember } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const guildMemberUpdate: BotEvent = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
        // Nickname change
        if (oldMember.nickname !== newMember.nickname) {
            await logEvent(newMember.guild.id, 'MEMBER_UPDATE', `**Surnom modifié** : ${oldMember.nickname || oldMember.user.username} ➔ ${newMember.nickname || newMember.user.username}`, config.colors.info, {
                target: newMember.user,
                extra: {
                    id: newMember.id
                }
            });
        }

        // Role change
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

        if (addedRoles.size > 0) {
            const roleNames = addedRoles.map(r => r.name).join(', ');
            await logEvent(newMember.guild.id, 'MEMBER_UPDATE', `**Rôles ajoutés** : ${roleNames}`, config.colors.success, {
                target: newMember.user,
                extra: { rolesAjoutes: roleNames }
            });
        }

        if (removedRoles.size > 0) {
            const roleNames = removedRoles.map(r => r.name).join(', ');
            await logEvent(newMember.guild.id, 'MEMBER_UPDATE', `**Rôles retirés** : ${roleNames}`, config.colors.error, {
                target: newMember.user,
                extra: { rolesRetires: roleNames }
            });
        }
    }
};

const userUpdate: BotEvent = {
    name: 'userUpdate',
    once: false,
    async execute(oldUser: User, newUser: User) {
        if (oldUser.username !== newUser.username) {
            // Note: Use one of the guilds the bot shares with the user for logging, often tricky. 
            // We might skip global user updates to avoid spam or log to all guilds.
            // For now, let's skip unless we have a specific context, or we can't get guildId easily without looping.
        }

        if (oldUser.avatar !== newUser.avatar) {
            // Same issue
        }
    }
};

export const memberEvents = [guildMemberUpdate, userUpdate];
