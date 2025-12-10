import mongoose, { Schema, Document } from 'mongoose';

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

const GuildSettingsSchema: Schema = new Schema({
    guildId: { type: String, required: true, unique: true },
    welcomeChannelId: { type: String },
    welcomeMessage: { type: String },
    logChannelId: { type: String },
    botPrefix: { type: String, default: '!' },
    botPersonality: { type: String, default: 'neutral' },
    embedColor: { type: Number, default: 5793266 },
    embedFooter: { type: String },
    raidShieldEnabled: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IGuildSettings>('GuildSettings', GuildSettingsSchema);
