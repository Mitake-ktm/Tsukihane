import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomCommand extends Document {
    guildId: string;
    triggerWord: string;
    responseText?: string;
    responseImageUrl?: string;
    createdBy: string;
    createdAt: Date;
}

const CustomCommandSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    triggerWord: { type: String, required: true },
    responseText: { type: String },
    responseImageUrl: { type: String },
    createdBy: { type: String, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

CustomCommandSchema.index({ guildId: 1, triggerWord: 1 }, { unique: true });

export default mongoose.model<ICustomCommand>('CustomCommand', CustomCommandSchema);
