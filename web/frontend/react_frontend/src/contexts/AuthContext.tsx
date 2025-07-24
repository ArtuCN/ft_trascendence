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
    const fetchToken = async ( ) => {
      const token = apiService.getToken();
      if (token) {
        const response = apiService.makeAuthenticatedRequest("/token");
      const data = await (await response).json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const userString = localStorage.getItem('user');
      if (userString)
      {
        const user = JSON.parse(userString);
        localStorage.setItem("username", user.username);
        localStorage.setItem("id", user.id);
        localStorage.setItem("mail", user.mail);
        console.log('Token:', localStorage.getItem('token'));
        console.log('User:', localStorage.getItem('user'));
        setUser((user));
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }
  fetchToken();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await apiService.login({
        username: email,
        password
      });
      
      apiService.saveToken(response.token);
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
      
      const response = await apiService.register({
        mail: email,
        username,
        psw: password
      });
      
      apiService.saveToken(response.token);
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
