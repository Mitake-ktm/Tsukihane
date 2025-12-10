import mongoose, { Schema, Document } from 'mongoose';

export interface IReactionRole extends Document {
    guildId: string;
    messageId: string;
    channelId: string;
    emoji: string;
    roleId: string;
    mode: string;
}

const ReactionRoleSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    emoji: { type: String, required: true },
    roleId: { type: String, required: true },
    mode: { type: String, default: 'multi' },
});

ReactionRoleSchema.index({ messageId: 1, emoji: 1 }, { unique: true });

export default mongoose.model<IReactionRole>('ReactionRole', ReactionRoleSchema);
