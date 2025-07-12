import connectDB from '../lib/mongodb';
import User, { IUser } from '../models/User';
import Question, { IQuestion } from '../models/Question';
import Answer, { IAnswer } from '../models/Answer';
import Vote, { IVote } from '../models/Vote';
import Notification, { INotification } from '../models/Notification';
import { generateToken } from '../lib/auth';

// Auth Services
export const authService = {
  async login(email: string, password: string) {
    await connectDB();
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString()
      },
      token
    };
  },

  async register(username: string, email: string, password: string) {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email is already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username is already taken');
      }
    }

    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    const token = generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString()
      },
      token
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
        // We'll handle this with aggregation
        break;
      case 'unanswered':
        // We'll handle this with aggregation
        break;
    }

    const questions = await Question.find(query)
      .populate('author', 'username')
      .sort(sort)
      .lean();

    // Get answer counts for each question
    const questionsWithCounts = await Promise.all(
      questions.map(async (question) => {
        const answerCount = await Answer.countDocuments({ question: question._id });
        return {
          id: question._id.toString(),
          title: question.title,
          description: question.description,
          tags: question.tags,
          authorId: question.author._id.toString(),
          author: question.author.username,
          createdAt: question.createdAt.toISOString(),
          updatedAt: question.updatedAt.toISOString(),
          acceptedAnswerId: question.acceptedAnswer?.toString(),
          answerCount,
          votes: question.votes,
          views: question.views
        };
      })
    );

    // Apply sorting that requires answer count
    if (sortBy === 'most-answers') {
      questionsWithCounts.sort((a, b) => b.answerCount - a.answerCount);
    } else if (sortBy === 'unanswered') {
      questionsWithCounts.sort((a, b) => {
        if (a.answerCount === 0 && b.answerCount === 0) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.answerCount === 0) return -1;
        if (b.answerCount === 0) return 1;
        return 0;
      });
    }

    return questionsWithCounts;
  },

  async createQuestion(questionData: any, userId: string) {
    await connectDB();

    const question = new Question({
      ...questionData,
      author: userId
    });

    await question.save();
    await question.populate('author', 'username');

    return {
      id: question._id.toString(),
      title: question.title,
      description: question.description,
      tags: question.tags,
      authorId: question.author._id.toString(),
      author: question.author.username,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      answerCount: 0,
      votes: question.votes,
      views: question.views
    };
  },

  async incrementViews(questionId: string) {
    await connectDB();
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
  },

  async getRelatedQuestions(questionId: string, tags: string[], limit: number = 5) {
    await connectDB();

    const questions = await Question.find({
      _id: { $ne: questionId },
      tags: { $in: tags }
    })
      .populate('author', 'username')
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    return Promise.all(
      questions.map(async (question) => {
        const answerCount = await Answer.countDocuments({ question: question._id });
        return {
          id: question._id.toString(),
          title: question.title,
          description: question.description,
          tags: question.tags,
          authorId: question.author._id.toString(),
          author: question.author.username,
          createdAt: question.createdAt.toISOString(),
          updatedAt: question.updatedAt.toISOString(),
          answerCount,
          votes: question.votes,
          views: question.views
        };
      })
    );
  }
};

// Answer Services
export const answerService = {
  async getAnswers(questionId: string) {
    await connectDB();

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'username')
      .sort({ isAccepted: -1, votes: -1, createdAt: 1 })
      .lean();

    return answers.map(answer => ({
      id: answer._id.toString(),
      questionId: answer.question.toString(),
      content: answer.content,
      authorId: answer.author._id.toString(),
      author: answer.author.username,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      votes: answer.votes,
      isAccepted: answer.isAccepted
    }));
  },

  async createAnswer(answerData: any, userId: string) {
    await connectDB();

    const answer = new Answer({
      ...answerData,
      author: userId
    });

    await answer.save();
    await answer.populate('author', 'username');

    return {
      id: answer._id.toString(),
      questionId: answer.question.toString(),
      content: answer.content,
      authorId: answer.author._id.toString(),
      author: answer.author.username,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      votes: answer.votes,
      isAccepted: answer.isAccepted
    };
  },

  async getUserAnswerCount(userId: string) {
    await connectDB();
    return Answer.countDocuments({ author: userId });
  },

  async acceptAnswer(answerId: string, questionId: string) {
    await connectDB();

    // Remove accepted status from other answers
    await Answer.updateMany(
      { question: questionId },
      { isAccepted: false }
    );

    // Set this answer as accepted
    await Answer.findByIdAndUpdate(answerId, { isAccepted: true });

    // Update question with accepted answer
    await Question.findByIdAndUpdate(questionId, { acceptedAnswer: answerId });
  }
};

// Vote Services
export const voteService = {
  async vote(answerId: string, voteType: 'up' | 'down', userId: string) {
    await connectDB();

    // Check if user has answered enough questions
    const userAnswerCount = await answerService.getUserAnswerCount(userId);
    if (userAnswerCount < 2) {
      throw new Error('You need to answer at least 2 questions before you can vote on answers.');
    }

    const existingVote = await Vote.findOne({ user: userId, answer: answerId });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote
        await Vote.findByIdAndDelete(existingVote._id);
        voteChange = voteType === 'up' ? -1 : 1;
      } else {
        // Change vote
        existingVote.type = voteType;
        await existingVote.save();
        voteChange = voteType === 'up' ? 2 : -2;
      }
    } else {
      // New vote
      const vote = new Vote({
        user: userId,
        answer: answerId,
        type: voteType
      });
      await vote.save();
      voteChange = voteType === 'up' ? 1 : -1;
    }

    // Update answer vote count
    await Answer.findByIdAndUpdate(answerId, { $inc: { votes: voteChange } });
  },

  async getUserVote(answerId: string, userId: string) {
    await connectDB();
    const vote = await Vote.findOne({ user: userId, answer: answerId });
    return vote?.type;
  }
};

// Notification Services
export const notificationService = {
  async getNotifications(userId: string) {
    await connectDB();

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return notifications.map(notification => ({
      id: notification._id.toString(),
      userId: notification.user.toString(),
      type: notification.type,
      message: notification.message,
      questionId: notification.question?.toString(),
      answerId: notification.answer?.toString(),
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString()
    }));
  },

  async createNotification(notificationData: any) {
    await connectDB();

    const notification = new Notification(notificationData);
    await notification.save();

    return {
      id: notification._id.toString(),
      userId: notification.user.toString(),
      type: notification.type,
      message: notification.message,
      questionId: notification.question?.toString(),
      answerId: notification.answer?.toString(),
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString()
    };
  },

  async markAsRead(notificationId: string) {
    await connectDB();
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  },

  async markAllAsRead(userId: string) {
    await connectDB();
    await Notification.updateMany({ user: userId }, { isRead: true });
  }
};