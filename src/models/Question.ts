import mongoose from 'mongoose';

export interface IQuestion extends mongoose.Document {
  title: string;
  description: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  acceptedAnswer?: mongoose.Types.ObjectId;
  views: number;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new mongoose.Schema({
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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
questionSchema.index({ title: 'text', description: 'text', tags: 'text' });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ votes: -1 });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);