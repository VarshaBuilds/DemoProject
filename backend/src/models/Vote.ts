import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  answerId: mongoose.Types.ObjectId;
  type: 'up' | 'down';
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerId: {
    type: Schema.Types.ObjectId,
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
VoteSchema.index({ userId: 1, answerId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);