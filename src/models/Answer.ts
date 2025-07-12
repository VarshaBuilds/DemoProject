import mongoose from 'mongoose';

export interface IAnswer extends mongoose.Document {
  question: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  votes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ votes: -1 });

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', answerSchema);