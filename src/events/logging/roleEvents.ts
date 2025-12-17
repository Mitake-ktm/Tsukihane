import { Role, AuditLogEvent } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const roleCreate: BotEvent = {
    name: 'roleCreate',
    once: false,
    async execute(role: Role) {
        await logEvent(role.guild.id, 'ROLE_CREATE', `**Rôle créé** : ${role.name}`, config.colors.success, {
            extra: {
                nom: role.name,
                id: role.id,
                hexColor: role.hexColor
            }
        });
    }
};

const roleDelete: BotEvent = {
    name: 'roleDelete',
    once: false,
    async execute(role: Role) {
        await logEvent(role.guild.id, 'ROLE_DELETE', `**Rôle supprimé** : ${role.name}`, config.colors.error, {
            extra: {
                nom: role.name,
                id: role.id
            }
        });
    }
};

const roleUpdate: BotEvent = {
    name: 'roleUpdate',
    once: false,
    async execute(oldRole: Role, newRole: Role) {
        if (oldRole.name !== newRole.name) {
            await logEvent(newRole.guild.id, 'ROLE_UPDATE', `**Rôle renommé** : ${oldRole.name} ➔ ${newRole.name}`, config.colors.warning, {
                extra: {
                    ancienNom: oldRole.name,
                    nouveauNom: newRole.name,
                    id: newRole.id
                }
            });
        }
    }
};

export const roleEvents = [roleCreate, roleDelete, roleUpdate];
