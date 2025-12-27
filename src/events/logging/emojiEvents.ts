import { GuildEmoji } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const emojiCreate: BotEvent = {
    name: 'emojiCreate',
    once: false,
    async execute(emoji: GuildEmoji) {
        await logEvent(emoji.guild.id, 'EMOJI_CREATE', `**Emoji créé** : ${emoji.name} (${emoji})`, config.colors.success, {
            extra: {
                nom: emoji.name,
                id: emoji.id,
                animated: emoji.animated ? 'Oui' : 'Non'
            }
        });
    }
};

const emojiDelete: BotEvent = {
    name: 'emojiDelete',
    once: false,
    async execute(emoji: GuildEmoji) {
        await logEvent(emoji.guild.id, 'EMOJI_DELETE', `**Emoji supprimé** : ${emoji.name}`, config.colors.error, {
            extra: {
                nom: emoji.name,
                id: emoji.id
            }
        });
    }
};

const emojiUpdate: BotEvent = {
    name: 'emojiUpdate',
    once: false,
    async execute(oldEmoji: GuildEmoji, newEmoji: GuildEmoji) {
        if (oldEmoji.name !== newEmoji.name) {
            await logEvent(newEmoji.guild.id, 'EMOJI_UPDATE', `**Emoji renommé** : ${oldEmoji.name} ➔ ${newEmoji.name} (${newEmoji})`, config.colors.warning, {
                extra: {
                    ancienNom: oldEmoji.name,
                    nouveauNom: newEmoji.name,
                    id: newEmoji.id
                }
            });
        }
    }
};

export const emojiEvents = [emojiCreate, emojiDelete, emojiUpdate];
