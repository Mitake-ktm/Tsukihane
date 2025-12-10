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
