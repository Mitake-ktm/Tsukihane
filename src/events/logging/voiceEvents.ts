import { VoiceState } from 'discord.js';
import { BotEvent } from '../../types';
import { logEvent } from '../../services/loggingService';
import { config } from '../../config/config';

const voiceStateUpdate: BotEvent = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState) {
        const guildId = newState.guild.id;
        const member = newState.member;
        if (!member) return;

        // Join
        if (!oldState.channelId && newState.channelId) {
            await logEvent(guildId, 'VOICE_JOIN', `**Rejoint le vocal** : <#${newState.channelId}>`, config.colors.success, {
                target: member.user,
                extra: { channel: newState.channel?.name }
            });
        }
        // Leave
        else if (oldState.channelId && !newState.channelId) {
            await logEvent(guildId, 'VOICE_LEAVE', `**Quitte le vocal** : <#${oldState.channelId}>`, config.colors.error, {
                target: member.user,
                extra: { channel: oldState.channel?.name }
            });
        }
        // Move
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            await logEvent(guildId, 'VOICE_MOVE', `**Change de salon** : <#${oldState.channelId}> ➔ <#${newState.channelId}>`, config.colors.info, {
                target: member.user,
                extra: {
                    from: oldState.channel?.name,
                    to: newState.channel?.name
                }
            });
        }
    }
};

export const voiceEvents = [voiceStateUpdate];
