import { User } from '../types/index.js';
import { apiService } from '../services/api.js';

export class AuthState {
  private user: User | null = null;
  private isLoading: boolean = true;
  private error: string | null = null;
  private successMessage: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    const token = apiService.getToken();
    if (token) {
      try {
        const response = await apiService.makeAuthenticatedRequest("/token");
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          localStorage.setItem("username", user.username);
          localStorage.setItem("id", user.id);
          localStorage.setItem("mail", user.mail);
          console.log('Token:', localStorage.getItem('token'));
          console.log('User:', localStorage.getItem('user'));
          this.user = user;
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiService.removeToken();
      }
    }
    this.isLoading = false;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return {
      user: this.user,
      isAuthenticated: !!this.user,
      isLoading: this.isLoading,
      error: this.error,
      successMessage: this.successMessage
    };
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
      this.notifyListeners();
      
      const response = await apiService.login({
        username: email,
        password
      });
      
      apiService.saveToken(response.token);
      this.user = response.user;
      this.successMessage = 'Login successful!';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      this.error = errorMessage;
      throw err;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async register(email: string, username: string, password: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
      this.notifyListeners();
      
      const response = await apiService.register({
        mail: email,
        username,
        psw: password
      });
      
      apiService.saveToken(response.token);
      this.user = response.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      this.error = errorMessage;
      throw err;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  logout(): void {
    apiService.removeToken();
    this.user = null;
    this.error = null;
    this.successMessage = null;
    this.notifyListeners();
  }

  clearError(): void {
    this.error = null;
    this.notifyListeners();
  }

  clearSuccessMessage(): void {
    this.successMessage = null;
    this.notifyListeners();
  }

  updateUser(user: User): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    this.notifyListeners();
  }
}

export const authState = new AuthState();
