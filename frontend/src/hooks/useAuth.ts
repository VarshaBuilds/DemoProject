import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('stackit_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp && Date.now() < payload.exp * 1000) {
          setUser({
            id: payload.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role as 'guest' | 'user' | 'admin',
            createdAt: new Date().toISOString()
          });
        } else {
          localStorage.removeItem('stackit_token');
        }
      } catch (error) {
        localStorage.removeItem('stackit_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('stackit_token', response.token);
      setUser(response.user);
      
      // Dispatch custom event for header updates
      window.dispatchEvent(new CustomEvent('userStateChanged'));
      
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      const response = await authService.register(username, email, password);
      localStorage.setItem('stackit_token', response.token);
      setUser(response.user);
      
      // Dispatch custom event for header updates
      window.dispatchEvent(new CustomEvent('userStateChanged'));
      
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('stackit_token');
    setUser(null);
    
    // Dispatch custom event for header updates
    window.dispatchEvent(new CustomEvent('userStateChanged'));
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