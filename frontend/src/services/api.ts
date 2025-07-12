import { User, Question, Answer, Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('stackit_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth Services
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }
};

// Question Services
export const questionService = {
  async getQuestions(searchQuery?: string, tag?: string, sortBy?: string): Promise<Question[]> {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (tag) params.append('tag', tag);
    if (sortBy) params.append('sortBy', sortBy);

    const response = await fetch(`${API_URL}/questions?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    const questions = await response.json();
    return questions.map((q: any) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      tags: q.tags,
      authorId: q.authorId,
      author: q.author,
      acceptedAnswerId: q.acceptedAnswerId,
      answerCount: q.answerCount,
      votes: q.votes,
      views: q.views,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));
  },

  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'answerCount' | 'votes' | 'views' | 'author'>): Promise<Question> {
    const response = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      throw new Error('Failed to create question');
    }

    const question = await response.json();
    return {
      id: question._id,
      title: question.title,
      description: question.description,
      tags: question.tags,
      authorId: question.authorId,
      author: question.author,
      acceptedAnswerId: question.acceptedAnswerId,
      answerCount: question.answerCount,
      votes: question.votes,
      views: question.views,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
  },

  async incrementViews(questionId: string) {
    await fetch(`${API_URL}/questions/${questionId}/views`, {
      method: 'PATCH'
    });
  },

  async getRelatedQuestions(questionId: string): Promise<Question[]> {
    const response = await fetch(`${API_URL}/questions/${questionId}/related`);
    
    if (!response.ok) {
      return [];
    }

    const questions = await response.json();
    return questions.map((q: any) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      tags: q.tags,
      authorId: q.authorId,
      author: q.author,
      acceptedAnswerId: q.acceptedAnswerId,
      answerCount: q.answerCount,
      votes: q.votes,
      views: q.views,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));
  }
};

// Answer Services
export const answerService = {
  async getAnswers(questionId: string): Promise<Answer[]> {
    const response = await fetch(`${API_URL}/answers/question/${questionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch answers');
    }

    const answers = await response.json();
    return answers.map((a: any) => ({
      id: a._id,
      questionId: a.questionId,
      content: a.content,
      authorId: a.authorId,
      author: a.author,
      votes: a.votes,
      isAccepted: a.isAccepted,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));
  },

  async createAnswer(answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author'>): Promise<Answer> {
    const response = await fetch(`${API_URL}/answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(answerData)
    });

    if (!response.ok) {
      throw new Error('Failed to create answer');
    }

    const answer = await response.json();
    return {
      id: answer._id,
      questionId: answer.questionId,
      content: answer.content,
      authorId: answer.authorId,
      author: answer.author,
      votes: answer.votes,
      isAccepted: answer.isAccepted,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt
    };
  },

  async acceptAnswer(answerId: string) {
    const response = await fetch(`${API_URL}/answers/${answerId}/accept`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to accept answer');
    }
  }
};

// Vote Services
export const voteService = {
  async vote(answerId: string, voteType: 'up' | 'down') {
    const response = await fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answerId, voteType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to vote');
    }
  },

  async getUserVote(answerId: string): Promise<'up' | 'down' | undefined> {
    const response = await fetch(`${API_URL}/votes/${answerId}/user`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    return data.voteType;
  }
};

// Notification Services
export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = await response.json();
    return notifications.map((n: any) => ({
      id: n._id,
      userId: n.userId,
      type: n.type,
      message: n.message,
      questionId: n.questionId,
      answerId: n.answerId,
      isRead: n.isRead,
      createdAt: n.createdAt
    }));
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    const n = await response.json();
    return {
      id: n._id,
      userId: n.userId,
      type: n.type,
      message: n.message,
      questionId: n.questionId,
      answerId: n.answerId,
      isRead: n.isRead,
      createdAt: n.createdAt
    };
  },

  async markAsRead(notificationId: string) {
    await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async markAllAsRead() {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  }
};