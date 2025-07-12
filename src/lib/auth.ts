import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-super-secret-jwt-key-here';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('stackit_token');
};

export const setTokenInStorage = (token: string): void => {
  localStorage.setItem('stackit_token', token);
};

export const removeTokenFromStorage = (): void => {
  localStorage.removeItem('stackit_token');
};