import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  type: 'answer' | 'comment' | 'mention' | 'vote';
  message: string;
  question?: mongoose.Types.ObjectId;
  answer?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['answer', 'comment', 'mention', 'vote'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);