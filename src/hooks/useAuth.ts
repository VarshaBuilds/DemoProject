import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import { verifyToken, getTokenFromStorage, setTokenInStorage, removeTokenFromStorage } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = getTokenFromStorage();
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        setUser({
          id: payload.userId,
          username: payload.username,
          email: payload.email,
          role: payload.role as 'guest' | 'user' | 'admin',
          createdAt: new Date().toISOString() // We'll get this from API in real implementation
        });
      } else {
        removeTokenFromStorage();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authService.login(email, password);
      setTokenInStorage(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      const response = await authService.register(username, email, password);
      setTokenInStorage(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    removeTokenFromStorage();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};