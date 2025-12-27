import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interfaces ---

export interface IUser extends Document {
    userId: string;
    guildId: string;
    xp: number;
    level: number;
    totalXp: number;
    lastXpGain: number;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IModLog extends Document {
    guildId: string;
    userId: string;
    moderatorId: string;
    action: string;
    reason?: string;
    details?: string;
    createdAt: Date;
}

export interface IWarning extends Document {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    createdAt: Date;
}

export interface IGuildSettings extends Document {
    guildId: string;
    welcomeChannelId?: string;
    welcomeMessage?: string;
    logChannelId?: string;
    botPrefix: string;
    botPersonality: string;
    embedColor: number;
    embedFooter?: string;
    raidShieldEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// --- Schemas ---

const UserSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    lastXpGain: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });
UserSchema.index({ guildId: 1, totalXp: -1 });

const ModLogSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    action: { type: String, required: true },
    reason: { type: String },
    details: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

ModLogSchema.index({ guildId: 1, createdAt: -1 });

const WarningSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

WarningSchema.index({ guildId: 1, userId: 1 });

const GuildSettingsSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    welcomeChannelId: { type: String },
    welcomeMessage: { type: String },
    logChannelId: { type: String },
    botPrefix: { type: String, default: '!' },
    botPersonality: { type: String, default: 'neutral' },
    embedColor: { type: Number, default: 5793266 },
    embedFooter: { type: String },
    raidShieldEnabled: { type: Boolean, default: false },
}, { timestamps: true });

// --- Models ---
// Prevent overwriting models if they are already compiled
export const User: Model<IUser> = mongoose.models.User || mongoose.model('User', UserSchema);
export const ModLog: Model<IModLog> = mongoose.models.ModLog || mongoose.model('ModLog', ModLogSchema);
export const Warning: Model<IWarning> = mongoose.models.Warning || mongoose.model('Warning', WarningSchema);
export const GuildSettings: Model<IGuildSettings> = mongoose.models.GuildSettings || mongoose.model('GuildSettings', GuildSettingsSchema);

// Additional models can be added here as needed

export interface IBlacklist extends Document {
    guildId: string;
    word: string;
    addedBy: string;
    createdAt: Date;
}

const BlacklistSchema = new Schema({
    guildId: { type: String, required: true },
    word: { type: String, required: true },
    addedBy: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

BlacklistSchema.index({ guildId: 1, word: 1 }, { unique: true });

export const Blacklist: Model<IBlacklist> = mongoose.models.Blacklist || mongoose.model('Blacklist', BlacklistSchema);

// --- ServerLog for comprehensive event logging ---

export type ServerLogType =
    | 'MESSAGE_DELETE' | 'MESSAGE_UPDATE' | 'MESSAGE_BULK_DELETE' | 'MESSAGE_PIN' | 'MESSAGE_UNPIN'
    | 'CHANNEL_CREATE' | 'CHANNEL_DELETE' | 'CHANNEL_UPDATE' | 'CHANNEL_PINS_UPDATE'
    | 'ROLE_CREATE' | 'ROLE_DELETE' | 'ROLE_UPDATE'
    | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'MEMBER_UPDATE' | 'MEMBER_BAN' | 'MEMBER_UNBAN' | 'MEMBER_KICK' | 'MEMBER_TIMEOUT'
    | 'VOICE_JOIN' | 'VOICE_LEAVE' | 'VOICE_MOVE' | 'VOICE_MUTE' | 'VOICE_DEAFEN'
    | 'GUILD_UPDATE' | 'INVITE_CREATE' | 'INVITE_DELETE' | 'INVITE_UPDATE'
    | 'EMOJI_CREATE' | 'EMOJI_DELETE' | 'EMOJI_UPDATE'
    | 'STICKER_CREATE' | 'STICKER_DELETE' | 'STICKER_UPDATE'
    | 'THREAD_CREATE' | 'THREAD_DELETE' | 'THREAD_UPDATE'
    | 'MODERATION_ACTION' | 'AUTOMOD_ACTION';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type LogCategory = 'MESSAGE' | 'CHANNEL' | 'ROLE' | 'MEMBER' | 'VOICE' | 'GUILD' | 'EMOJI' | 'THREAD' | 'MODERATION' | 'OTHER';

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
    details: Record<string, unknown>;
    createdAt: Date;
}

const ServerLogSchema = new Schema({
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

ServerLogSchema.index({ guildId: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, type: 1, createdAt: -1 });
ServerLogSchema.index({ guildId: 1, category: 1, createdAt: -1 });

export const ServerLog: Model<IServerLog> = mongoose.models.ServerLog || mongoose.model('ServerLog', ServerLogSchema);

