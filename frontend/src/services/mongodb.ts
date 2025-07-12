import connectDB from '../lib/mongodb';
import User from '../models/User';
import Question from '../models/Question';
import Answer from '../models/Answer';
import Vote from '../models/Vote';
import Notification from '../models/Notification';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Services
export const authService = {
  async register(username: string, email: string, password: string) {
    await connectDB();
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  },

  async login(email: string, password: string) {
    await connectDB();
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }
};

// Question Services
export const questionService = {
  async getQuestions(searchQuery?: string, tag?: string, sortBy?: string) {
    await connectDB();
    
    let query: any = {};
    
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    let sort: any = { createdAt: -1 };
    
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'most-answers':
        sort = { answerCount: -1 };
        break;
      case 'unanswered':
        query.answerCount = 0;
        break;
    }
    
    const questions = await Question.find(query).sort(sort);
    
    return questions.map(q => ({
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      tags: q.tags,
      authorId: q.authorId.toString(),
      author: q.author,
      acceptedAnswerId: q.acceptedAnswerId?.toString(),
      answerCount: q.answerCount,
      votes: q.votes,
      views: q.views,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));
  },

  async createQuestion(questionData: any, userId: string) {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const question = await Question.create({
      ...questionData,
      authorId: userId,
      author: user.username
    });
    
    return {
      id: question._id.toString(),
      title: question.title,
      description: question.description,
      tags: question.tags,
      authorId: question.authorId.toString(),
      author: question.author,
      answerCount: question.answerCount,
      votes: question.votes,
      views: question.views,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
  },

  async incrementViews(questionId: string) {
    await connectDB();
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
  }
};

// Answer Services
export const answerService = {
  async getAnswers(questionId: string) {
    await connectDB();
    
    const answers = await Answer.find({ questionId }).sort({ createdAt: -1 });
    
    return answers.map(a => ({
      id: a._id.toString(),
      questionId: a.questionId.toString(),
      content: a.content,
      authorId: a.authorId.toString(),
      author: a.author,
      votes: a.votes,
      isAccepted: a.isAccepted,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));
  },

  async createAnswer(answerData: any, userId: string) {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const answer = await Answer.create({
      ...answerData,
      authorId: userId,
      author: user.username
    });
    
    // Update question answer count
    await Question.findByIdAndUpdate(answerData.questionId, { 
      $inc: { answerCount: 1 } 
    });
    
    // Update user answer count
    await User.findByIdAndUpdate(userId, { 
      $inc: { answerCount: 1 } 
    });
    
    return {
      id: answer._id.toString(),
      questionId: answer.questionId.toString(),
      content: answer.content,
      authorId: answer.authorId.toString(),
      author: answer.author,
      votes: answer.votes,
      isAccepted: answer.isAccepted,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt
    };
  },

  async getUserAnswerCount(userId: string) {
    await connectDB();
    const user = await User.findById(userId);
    return user?.answerCount || 0;
  }
};

// Vote Services
export const voteService = {
  async vote(answerId: string, voteType: 'up' | 'down', userId: string) {
    await connectDB();
    
    // Check if user has answered enough questions
    const user = await User.findById(userId);
    if (!user || user.answerCount < 2) {
      throw new Error('You must answer at least 2 questions before voting');
    }
    
    // Check existing vote
    const existingVote = await Vote.findOne({ userId, answerId });
    
    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        await Answer.findByIdAndUpdate(answerId, { 
          $inc: { votes: voteType === 'up' ? -1 : 1 } 
        });
      } else {
        // Change vote
        await Vote.findByIdAndUpdate(existingVote._id, { type: voteType });
        await Answer.findByIdAndUpdate(answerId, { 
          $inc: { votes: voteType === 'up' ? 2 : -2 } 
        });
      }
    } else {
      // New vote
      await Vote.create({ userId, answerId, type: voteType });
      await Answer.findByIdAndUpdate(answerId, { 
        $inc: { votes: voteType === 'up' ? 1 : -1 } 
      });
    }
  },

  async getUserVote(answerId: string, userId: string) {
    await connectDB();
    const vote = await Vote.findOne({ userId, answerId });
    return vote?.type;
  }
};

// Notification Services
export const notificationService = {
  async getNotifications(userId: string) {
    await connectDB();
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return notifications.map(n => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      type: n.type,
      message: n.message,
      questionId: n.questionId?.toString(),
      answerId: n.answerId?.toString(),
      isRead: n.isRead,
      createdAt: n.createdAt
    }));
  },

  async createNotification(notificationData: any) {
    await connectDB();
    
    const notification = await Notification.create(notificationData);
    
    return {
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      message: notification.message,
      questionId: notification.questionId?.toString(),
      answerId: notification.answerId?.toString(),
      isRead: notification.isRead,
      createdAt: notification.createdAt
    };
  },

  async markAsRead(notificationId: string) {
    await connectDB();
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  },

  async markAllAsRead(userId: string) {
    await connectDB();
    await Notification.updateMany({ userId }, { isRead: true });
  }
};