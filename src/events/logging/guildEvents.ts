import { GuildBan, Guild, AuditLogEvent, User } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const guildBanAdd: BotEvent = {
    name: 'guildBanAdd',
    once: false,
    async execute(ban: GuildBan) {
        // Fetch executor
        let executor = null;
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            const banLog = fetchedLogs.entries.first();
            if (banLog && banLog.target?.id === ban.user.id) {
                executor = banLog.executor;
            }
        } catch (e) { }

        await logEvent(ban.guild.id, 'MEMBER_BAN', `**Membre banni** : ${ban.user.tag}`, config.colors.error, {
            target: ban.user,
            executor: (executor as User) || undefined,
            reason: ban.reason || 'Aucune raison fournie'
        });
    }
};

const guildBanRemove: BotEvent = {
    name: 'guildBanRemove',
    once: false,
    async execute(ban: GuildBan) {
        let executor = null;
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanRemove,
            });
            const unbanLog = fetchedLogs.entries.first();
            if (unbanLog && unbanLog.target?.id === ban.user.id) {
                executor = unbanLog.executor;
            }
        } catch (e) { }

        await logEvent(ban.guild.id, 'MEMBER_UNBAN', `**Bannissement révoqué** : ${ban.user.tag}`, config.colors.success, {
            target: ban.user,
            executor: (executor as User) || undefined
        });
    }
};

const guildUpdate: BotEvent = {
    name: 'guildUpdate',
    once: false,
    async execute(oldGuild: Guild, newGuild: Guild) {
        if (oldGuild.name !== newGuild.name) {
            await logEvent(newGuild.id, 'GUILD_UPDATE', `**Serveur renommé** : ${oldGuild.name} ➔ ${newGuild.name}`, config.colors.warning, {
                extra: { oldName: oldGuild.name, newName: newGuild.name }
            });
        }
    }
};

// Also listen to Invite events here for convenience, or separate file
const inviteCreate: BotEvent = {
    name: 'inviteCreate',
    once: false,
    async execute(invite: any) {
        await logEvent(invite.guild.id, 'INVITE_CREATE', `**Invitation créée** : ${invite.code}`, config.colors.info, {
            executor: invite.inviter,
            extra: {
                code: invite.code,
                maxUses: invite.maxUses,
                expiresAt: invite.expiresAt
            }
        });
    }
};

const inviteDelete: BotEvent = {
    name: 'inviteDelete',
    once: false,
    async execute(invite: any) {
        await logEvent(invite.guild.id, 'INVITE_DELETE', `**Invitation supprimée** : ${invite.code}`, config.colors.error, {
            extra: { code: invite.code }
        });
    }
};

export const guildEvents = [guildBanAdd, guildBanRemove, guildUpdate, inviteCreate, inviteDelete];
