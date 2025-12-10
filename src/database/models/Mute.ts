import mongoose, { Schema, Document } from 'mongoose';

export interface IMute extends Document {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    expiresAt: Date;
    active: boolean;
    createdAt: Date;
}

const MuteSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

MuteSchema.index({ active: 1, expiresAt: 1 });

export default mongoose.model<IMute>('Mute', MuteSchema);
