import mongoose, { Schema, Document } from 'mongoose';

export interface IModLog extends Document {
    guildId: string;
    userId: string;
    moderatorId: string;
    action: string;
    reason?: string;
    details?: string;
    createdAt: Date;
}

const ModLogSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    action: { type: String, required: true },
    reason: { type: String },
    details: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

ModLogSchema.index({ guildId: 1, createdAt: -1 });

export default mongoose.model<IModLog>('ModLog', ModLogSchema);
