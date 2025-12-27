import { Sticker } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const stickerCreate: BotEvent = {
    name: 'stickerCreate',
    once: false,
    async execute(sticker: Sticker) {
        if (!sticker.guild) return;

        await logEvent(sticker.guild.id, 'STICKER_CREATE', `**Sticker créé** : ${sticker.name}`, config.colors.success, {
            extra: {
                nom: sticker.name,
                id: sticker.id,
                description: sticker.description || 'Aucune'
            }
        });
    }
};

const stickerDelete: BotEvent = {
    name: 'stickerDelete',
    once: false,
    async execute(sticker: Sticker) {
        if (!sticker.guild) return;

        await logEvent(sticker.guild.id, 'STICKER_DELETE', `**Sticker supprimé** : ${sticker.name}`, config.colors.error, {
            extra: {
                nom: sticker.name,
                id: sticker.id
            }
        });
    }
};

const stickerUpdate: BotEvent = {
    name: 'stickerUpdate',
    once: false,
    async execute(oldSticker: Sticker, newSticker: Sticker) {
        if (!newSticker.guild) return;

        if (oldSticker.name !== newSticker.name) {
            await logEvent(newSticker.guild.id, 'STICKER_UPDATE', `**Sticker renommé** : ${oldSticker.name} ➔ ${newSticker.name}`, config.colors.warning, {
                extra: {
                    ancienNom: oldSticker.name,
                    nouveauNom: newSticker.name,
                    id: newSticker.id
                }
            });
        }
    }
};

export const stickerEvents = [stickerCreate, stickerDelete, stickerUpdate];
