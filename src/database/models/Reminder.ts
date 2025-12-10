import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
    userId: string;
    guildId: string;
    channelId?: string;
    message: string;
    remindAt: Date;
    completed: boolean;
    createdAt: Date;
}

const ReminderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String },
    message: { type: String, required: true },
    remindAt: { type: Date, required: true },
    completed: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

ReminderSchema.index({ remindAt: 1, completed: 1 });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
