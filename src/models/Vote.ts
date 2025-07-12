import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerId: {
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
VoteSchema.index({ userId: 1, answerId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);