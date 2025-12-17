import { ChannelType, GuildChannel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { BotEvent } from '../../types'; // Assuming there is a BotEvent type, need to verify or create local interface
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const channelCreate: BotEvent = {
    name: 'channelCreate',
    once: false,
    async execute(channel: GuildChannel) {
        if (!channel.guild) return;

        let description = `**Canal créé** : ${channel.name} (<#${channel.id}>)`;
        let type = 'Inconnu';

        if (channel.type === ChannelType.GuildText) type = 'Texte';
        else if (channel.type === ChannelType.GuildVoice) type = 'Vocal';
        else if (channel.type === ChannelType.GuildCategory) type = 'Catégorie';
        else if (channel.type === ChannelType.GuildAnnouncement) type = 'Annonce';

        description += `\n**Type** : ${type}`;

        await logEvent(channel.guild.id, 'CHANNEL_CREATE', description, config.colors.success, {
            extra: {
                nom: channel.name,
                id: channel.id,
                type: type
            }
        });
    }
};

const channelDelete: BotEvent = {
    name: 'channelDelete',
    once: false,
    async execute(channel: GuildChannel) {
        if (!channel.guild) return;

        await logEvent(channel.guild.id, 'CHANNEL_DELETE', `**Canal supprimé** : ${channel.name}`, config.colors.error, {
            extra: {
                nom: channel.name,
                id: channel.id
            }
        });
    }
};

const channelUpdate: BotEvent = {
    name: 'channelUpdate',
    once: false,
    async execute(oldChannel: GuildChannel, newChannel: GuildChannel) {
        if (!oldChannel.guild) return;

        if (oldChannel.name !== newChannel.name) {
            await logEvent(newChannel.guild.id, 'CHANNEL_UPDATE', `**Canal renommé** : ${oldChannel.name} ➔ ${newChannel.name} (<#${newChannel.id}>)`, config.colors.warning, {
                extra: {
                    ancienNom: oldChannel.name,
                    nouveauNom: newChannel.name,
                    id: newChannel.id
                }
            });
        }
    }
};

export const channelEvents = [channelCreate, channelDelete, channelUpdate];
