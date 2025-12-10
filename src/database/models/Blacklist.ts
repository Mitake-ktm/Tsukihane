import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklist extends Document {
    guildId: string;
    word: string;
    addedBy: string;
    createdAt: Date;
}

const BlacklistSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    word: { type: String, required: true },
    addedBy: { type: String, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

BlacklistSchema.index({ guildId: 1, word: 1 }, { unique: true });

export default mongoose.model<IBlacklist>('Blacklist', BlacklistSchema);
