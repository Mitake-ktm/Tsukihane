import { ThreadChannel, AnyThreadChannel } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const threadCreate: BotEvent = {
    name: 'threadCreate',
    once: false,
    async execute(thread: AnyThreadChannel, newlyCreated: boolean) {
        if (!newlyCreated || !thread.guild) return;

        await logEvent(thread.guild.id, 'THREAD_CREATE', `**Thread créé** : ${thread.name} (<#${thread.id}>)`, config.colors.success, {
            channelId: thread.id,
            channelName: thread.name,
            extra: {
                nom: thread.name,
                id: thread.id,
                parent: thread.parent?.name || 'Inconnu',
                archived: thread.archived ? 'Oui' : 'Non'
            }
        });
    }
};

const threadDelete: BotEvent = {
    name: 'threadDelete',
    once: false,
    async execute(thread: AnyThreadChannel) {
        if (!thread.guild) return;

        await logEvent(thread.guild.id, 'THREAD_DELETE', `**Thread supprimé** : ${thread.name}`, config.colors.error, {
            extra: {
                nom: thread.name,
                id: thread.id,
                parent: thread.parent?.name || 'Inconnu'
            }
        });
    }
};

const threadUpdate: BotEvent = {
    name: 'threadUpdate',
    once: false,
    async execute(oldThread: AnyThreadChannel, newThread: AnyThreadChannel) {
        if (!newThread.guild) return;

        // Name change
        if (oldThread.name !== newThread.name) {
            await logEvent(newThread.guild.id, 'THREAD_UPDATE', `**Thread renommé** : ${oldThread.name} ➔ ${newThread.name}`, config.colors.warning, {
                channelId: newThread.id,
                channelName: newThread.name,
                extra: {
                    ancienNom: oldThread.name,
                    nouveauNom: newThread.name,
                    id: newThread.id
                }
            });
        }

        // Archive status change
        if (oldThread.archived !== newThread.archived) {
            const status = newThread.archived ? 'archivé' : 'désarchivé';
            await logEvent(newThread.guild.id, 'THREAD_UPDATE', `**Thread ${status}** : ${newThread.name}`, config.colors.info, {
                channelId: newThread.id,
                channelName: newThread.name,
                extra: {
                    nom: newThread.name,
                    id: newThread.id,
                    status
                }
            });
        }

        // Lock status change
        if (oldThread.locked !== newThread.locked) {
            const status = newThread.locked ? 'verrouillé' : 'déverrouillé';
            await logEvent(newThread.guild.id, 'THREAD_UPDATE', `**Thread ${status}** : ${newThread.name}`, config.colors.warning, {
                channelId: newThread.id,
                channelName: newThread.name,
                extra: {
                    nom: newThread.name,
                    id: newThread.id,
                    status
                }
            });
        }
    }
};

export const threadEvents = [threadCreate, threadDelete, threadUpdate];
