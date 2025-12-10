import mongoose, { Schema, Document } from 'mongoose';

export interface IWritingTask extends Document {
    ownerId: string;
    title: string;
    description?: string;
    deadline?: Date;
    progress: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const WritingTaskSchema: Schema = new Schema({
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    progress: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
}, {
    timestamps: true
});

export default mongoose.model<IWritingTask>('WritingTask', WritingTaskSchema);
