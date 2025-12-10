import mongoose, { Schema, Document } from 'mongoose';

export interface IOwnerNote extends Document {
    ownerId: string;
    title: string;
    content?: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const OwnerNoteSchema: Schema = new Schema({
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    category: { type: String, default: 'general' },
}, {
    timestamps: true
});

export default mongoose.model<IOwnerNote>('OwnerNote', OwnerNoteSchema);
