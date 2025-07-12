import mongoose from 'mongoose';

export interface IVote extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  answer: mongoose.Types.ObjectId;
  type: 'up' | 'down';
  createdAt: Date;
}

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  type: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Ensure one vote per user per answer
voteSchema.index({ user: 1, answer: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', voteSchema);