import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
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

// Indexes for better performance
AnswerSchema.index({ questionId: 1 });
AnswerSchema.index({ authorId: 1 });
AnswerSchema.index({ createdAt: -1 });

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);