import mongoose, { Schema, Document } from 'mongoose';

// Comprehensive log types for all server events
export type ServerLogType =
    // Message events
    | 'MESSAGE_DELETE' | 'MESSAGE_UPDATE' | 'MESSAGE_BULK_DELETE' | 'MESSAGE_PIN' | 'MESSAGE_UNPIN'
    // Channel events
    | 'CHANNEL_CREATE' | 'CHANNEL_DELETE' | 'CHANNEL_UPDATE' | 'CHANNEL_PINS_UPDATE'
    // Role events
    | 'ROLE_CREATE' | 'ROLE_DELETE' | 'ROLE_UPDATE'
    // Member events
    | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'MEMBER_UPDATE' | 'MEMBER_BAN' | 'MEMBER_UNBAN' | 'MEMBER_KICK' | 'MEMBER_TIMEOUT'
    // Voice events
    | 'VOICE_JOIN' | 'VOICE_LEAVE' | 'VOICE_MOVE' | 'VOICE_MUTE' | 'VOICE_DEAFEN' | 'VOICE_SERVER_MUTE' | 'VOICE_SERVER_DEAFEN' | 'VOICE_DISCONNECT'
    // Guild events
    | 'GUILD_UPDATE' | 'INVITE_CREATE' | 'INVITE_DELETE' | 'INVITE_UPDATE'
    // Emoji/Sticker events
    | 'EMOJI_CREATE' | 'EMOJI_DELETE' | 'EMOJI_UPDATE'
    | 'STICKER_CREATE' | 'STICKER_DELETE' | 'STICKER_UPDATE'
    // Thread events
    | 'THREAD_CREATE' | 'THREAD_DELETE' | 'THREAD_UPDATE' | 'THREAD_MEMBER_UPDATE'
    // Scheduled events
    | 'SCHEDULED_EVENT_CREATE' | 'SCHEDULED_EVENT_DELETE' | 'SCHEDULED_EVENT_UPDATE'
    // Moderation events
    | 'MODERATION_ACTION' | 'AUTOMOD_ACTION'
    // Webhook events
    | 'WEBHOOK_CREATE' | 'WEBHOOK_DELETE' | 'WEBHOOK_UPDATE'
    // Integration events
    | 'INTEGRATION_CREATE' | 'INTEGRATION_DELETE' | 'INTEGRATION_UPDATE'
    // Stage events
    | 'STAGE_CREATE' | 'STAGE_DELETE' | 'STAGE_UPDATE';

// Severity levels for filtering
export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// Category for easier filtering
export type LogCategory =
    | 'MESSAGE' | 'CHANNEL' | 'ROLE' | 'MEMBER' | 'VOICE'
    | 'GUILD' | 'EMOJI' | 'THREAD' | 'MODERATION' | 'OTHER';

export interface IServerLog extends Document {
    guildId: string;
    type: ServerLogType;
    category: LogCategory;
    severity: LogSeverity;
    executorId?: string;
    executorTag?: string;
    targetId?: string;
    targetTag?: string;
    channelId?: string;
    channelName?: string;
    description: string;
    details: Record<string, any>;
    createdAt: Date;
}

const ServerLogSchema: Schema = new Schema({
    guildId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    severity: { type: String, default: 'INFO', index: true },
    executorId: { type: String, index: true },
    executorTag: { type: String },
    targetId: { type: String, index: true },
    targetTag: { type: String },
    channelId: { type: String, index: true },
    channelName: { type: String },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Compound indexes for common queries
ServerLogSchema.index({ guildId: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, type: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, category: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, executorId: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, targetId: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, severity: 1, createdAt: -1 });

// Text index for searching descriptions
ServerLogSchema.index({ description: 'text' });

// Helper to get category from type
export function getCategoryFromType(type: ServerLogType): LogCategory {
    if (type.startsWith('MESSAGE')) return 'MESSAGE';
    if (type.startsWith('CHANNEL')) return 'CHANNEL';
    if (type.startsWith('ROLE')) return 'ROLE';
    if (type.startsWith('MEMBER')) return 'MEMBER';
    if (type.startsWith('VOICE')) return 'VOICE';
    if (type.startsWith('GUILD') || type.startsWith('INVITE')) return 'GUILD';
    if (type.startsWith('EMOJI') || type.startsWith('STICKER')) return 'EMOJI';
    if (type.startsWith('THREAD')) return 'THREAD';
    if (type.startsWith('MODERATION') || type.startsWith('AUTOMOD')) return 'MODERATION';
    return 'OTHER';
}

// Helper to get severity from type
export function getSeverityFromType(type: ServerLogType): LogSeverity {
    const errorTypes = ['MESSAGE_DELETE', 'MESSAGE_BULK_DELETE', 'CHANNEL_DELETE', 'ROLE_DELETE', 'MEMBER_BAN', 'MEMBER_KICK', 'MEMBER_LEAVE', 'VOICE_DISCONNECT', 'VOICE_SERVER_MUTE', 'VOICE_SERVER_DEAFEN', 'EMOJI_DELETE', 'STICKER_DELETE', 'THREAD_DELETE', 'WEBHOOK_DELETE'];
    const warningTypes = ['MESSAGE_UPDATE', 'CHANNEL_UPDATE', 'ROLE_UPDATE', 'MEMBER_UPDATE', 'MEMBER_TIMEOUT', 'GUILD_UPDATE', 'EMOJI_UPDATE', 'STICKER_UPDATE', 'THREAD_UPDATE'];
    const criticalTypes = ['MODERATION_ACTION', 'AUTOMOD_ACTION'];

    if (criticalTypes.includes(type)) return 'CRITICAL';
    if (errorTypes.includes(type)) return 'ERROR';
    if (warningTypes.includes(type)) return 'WARNING';
    return 'INFO';
}

export default mongoose.model<IServerLog>('ServerLog', ServerLogSchema);
