import mongoose, { Schema, Document } from 'mongoose';

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

const UserSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    lastXpGain: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
}, {
    timestamps: true
});

// Compound unique index for user per guild
UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });
// Index for leaderboard
UserSchema.index({ guildId: 1, totalXp: -1 });

export default mongoose.model<IUser>('User', UserSchema);
