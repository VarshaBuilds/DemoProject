import { User, Question, Answer, Notification } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('stackit_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }

  return response.json();
}

// Auth Services
export const authService = {
  async login(email: string, password: string) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async register(username: string, email: string, password: string) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    return response;
  }
};

// Question Services
export const questionService = {
  async getQuestions(searchQuery?: string, tag?: string, sortBy?: string) {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (tag) params.append('tag', tag);
    if (sortBy) params.append('sort', sortBy);
    
    const queryString = params.toString();
    const endpoint = `/questions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'answerCount' | 'votes' | 'views' | 'author'>, userId: string) {
    return apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify({ ...questionData, userId }),
    });
  },

  async incrementViews(questionId: string) {
    return apiRequest(`/questions/${questionId}/views`, {
      method: 'PATCH',
    });
  },

  async getRelatedQuestions(questionId: string, tags: string[], limit: number = 5) {
    return apiRequest(`/questions/${questionId}/related?limit=${limit}`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }
};

// Answer Services
export const answerService = {
  async getAnswers(questionId: string) {
    return apiRequest(`/questions/${questionId}/answers`);
  },

  async createAnswer(answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author'>, userId: string) {
    return apiRequest('/answers', {
      method: 'POST',
      body: JSON.stringify({ ...answerData, userId }),
    });
  },

  async getUserAnswerCount(userId: string) {
    const response = await apiRequest(`/users/${userId}/answer-count`);
    return response.count;
  },

  async acceptAnswer(answerId: string, questionId: string) {
    return apiRequest(`/answers/${answerId}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ questionId }),
    });
  }
};

// Vote Services
export const voteService = {
  async vote(answerId: string, voteType: 'up' | 'down', userId: string) {
    return apiRequest(`/answers/${answerId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType, userId }),
    });
  },

  async getUserVote(answerId: string, userId: string) {
    const response = await apiRequest(`/answers/${answerId}/vote/${userId}`);
    return response.voteType;
  }
};

// Notification Services
export const notificationService = {
  async getNotifications(userId: string) {
    return apiRequest(`/users/${userId}/notifications`);
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    return apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  async markAsRead(notificationId: string) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAsRead(userId: string) {
    return apiRequest(`/users/${userId}/notifications/read-all`, {
      method: 'PATCH',
    });
  }
};