import { useState, useEffect } from 'react';
import { User } from '../types';

// Get all users (mock + registered)
const getAllUsers = () => {
  const mockUsers = [
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    }
  ];
  
  const registeredUsers = JSON.parse(localStorage.getItem('stackit_registered_users') || '[]');
  return [...mockUsers, ...registeredUsers];
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('stackit_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Ensure the user object has all required fields
        if (parsedUser && parsedUser.id && parsedUser.username && parsedUser.email) {
          setUser(parsedUser);
        } else {
          // Clear invalid user data
          localStorage.removeItem('stackit_user');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('stackit_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const allUsers = getAllUsers();
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };

    console.log('Logging in user:', user); // Debug log
    setUser(user);
    localStorage.setItem('stackit_user', JSON.stringify(user));
    
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new Event('userStateChanged'));
    return user;
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const allUsers = getAllUsers();
    
    // Check if email already exists
    if (allUsers.some(u => u.email === email)) {
      throw new Error('Email is already registered');
    }

    // Check if username already exists
    if (allUsers.some(u => u.username === username)) {
      throw new Error('Username is already taken');
    }

    // Basic validation
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Save to registered users list with password for login verification
    const existingUsers = JSON.parse(localStorage.getItem('stackit_registered_users') || '[]');
    const userWithPassword = { 
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      password: password,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
    existingUsers.push(userWithPassword);
    localStorage.setItem('stackit_registered_users', JSON.stringify(existingUsers));

    // Save current user session (without password)
    console.log('Registering user:', newUser); // Debug log
    setUser(newUser);
    localStorage.setItem('stackit_user', JSON.stringify(newUser));
    
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new Event('userStateChanged'));
    return newUser;
  };

  const logout = async () => {
    console.log('Logging out user'); // Debug log
    setUser(null);
    localStorage.removeItem('stackit_user');
    
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new Event('userStateChanged'));
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