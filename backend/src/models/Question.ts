import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  description: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  author: string;
  acceptedAnswerId?: mongoose.Types.ObjectId;
  answerCount: number;
  votes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  acceptedAnswerId: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  answerCount: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
QuestionSchema.index({ authorId: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IQuestion>('Question', QuestionSchema);