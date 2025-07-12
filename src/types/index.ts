export interface User {
  id: string;
  username: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  acceptedAnswerId?: string;
  answerCount: number;
  votes: number;
  views: number;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  votes: number;
  isAccepted: boolean;
  userVote?: 'up' | 'down';
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  type: 'up' | 'down';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention';
  message: string;
  questionId?: string;
  answerId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
}