import { useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { AuthContext } from './AuthContextDefinition';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      authApi.getCurrentUser()
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (token: string, userData?: User) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    try {
      // If userData is provided (from Google login), use it
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Otherwise get user info from API
        const response = await authApi.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 