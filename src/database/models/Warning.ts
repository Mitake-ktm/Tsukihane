import mongoose, { Schema, Document } from 'mongoose';

export interface IWarning extends Document {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    createdAt: Date;
}

const WarningSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

WarningSchema.index({ guildId: 1, userId: 1 });

export default mongoose.model<IWarning>('Warning', WarningSchema);
