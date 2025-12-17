import mongoose, { Schema, Document } from 'mongoose';

export interface IServerLog extends Document {
    guildId: string;
    type: string;
    executorId?: string;
    targetId?: string;
    details: any;
    createdAt: Date;
}

const ServerLogSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    type: { type: String, required: true },
    executorId: { type: String },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

ServerLogSchema.index({ guildId: 1, createdAt: -1 });
ServerLogSchema.index({ type: 1 });

export default mongoose.model<IServerLog>('ServerLog', ServerLogSchema);
