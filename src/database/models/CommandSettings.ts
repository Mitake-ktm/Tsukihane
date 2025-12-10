import mongoose, { Schema, Document } from 'mongoose';

export interface ICommandSettings extends Document {
    guildId: string;
    commandName: string;
    enabled: boolean;
    cooldownSeconds: number;
    allowedRoles: string[];
    alias?: string;
}

const CommandSettingsSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    commandName: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    cooldownSeconds: { type: Number, default: 0 },
    allowedRoles: { type: [String], default: [] },
    alias: { type: String },
}, {
    _id: false // We generally query by guildId/commandName
});

CommandSettingsSchema.index({ guildId: 1, commandName: 1 }, { unique: true });

export default mongoose.model<ICommandSettings>('CommandSettings', CommandSettingsSchema);
