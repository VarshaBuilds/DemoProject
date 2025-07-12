// JWT token utilities for frontend
export const generateToken = (user: any): string => {
  // This would typically be done on the backend
  // For now, we'll create a simple token structure
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return btoa(JSON.stringify(payload));
};

export const verifyToken = (token: string): any | null => {
  try {
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return payload;
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