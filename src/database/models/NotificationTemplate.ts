import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
    guildId: string;
    name: string;
    type: string;
    channelId?: string;
    messageTemplate: string;
    embedEnabled: boolean;
    createdAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    channelId: { type: String },
    messageTemplate: { type: String, required: true },
    embedEnabled: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

NotificationTemplateSchema.index({ guildId: 1, name: 1 }, { unique: true });

export default mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
