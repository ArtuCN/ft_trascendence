import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  mail: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthenticated = !!user;
  useEffect(() => {

    const token = apiService.getToken();
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      setIsLoading(false);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return;
    }
    const fetchToken = async () => {
      const token = apiService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiService.makeAuthenticatedRequest("/token");
      const data = await (response).json();

      localStorage.setItem('token', data.token);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      }

      setIsLoading(false);
    };

  fetchToken();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiService.login({ username: email, password });

      apiService.saveToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setSuccessMessage('Login successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiService.register({ mail: email, username, psw: password });
      console.log("full response", response);
      apiService.saveToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log("response user ", response.user);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  const logout = (): void => {
    apiService.removeToken();
    setUser(null);
    setError(null);
    setSuccessMessage(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const clearSuccessMessage = (): void => {
    setSuccessMessage(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    successMessage,
    clearError,
    clearSuccessMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
