import { User } from '../types/index.js';
import { apiService } from '../services/api.js';
import { router } from '../router/router.js';

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
          this.user = user;
          
          // Se l'utente è già autenticato, naviga alla home
          router.navigate('/');
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
        mail: email,
        psw: password
      });
      
      apiService.saveToken(response.token);
      this.user = response.user;
      this.successMessage = 'Login successful!';
      
      // Salva dati utente nel localStorage (come in googleAuth)
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("id", response.user.id.toString());
      localStorage.setItem("mail", response.user.mail);
      
      // Redirect alla home page dopo il login
      router.navigate('/');
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
      
      // Salva dati utente nel localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("id", response.user.id.toString());
      localStorage.setItem("mail", response.user.mail);
      
      // Redirect alla home page dopo la registrazione
      router.navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      this.error = errorMessage;
      throw err;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async googleAuth(credential: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
      this.notifyListeners();
      
      const response = await apiService.googleAuth(credential);
      
      apiService.saveToken(response.token);
      this.user = response.user;
      this.successMessage = 'Google login successful!';
      
      // Salva dati utente nel localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("id", response.user.id.toString());
      localStorage.setItem("mail", response.user.mail);
      
      // Redirect alla home page dopo il login Google
      router.navigate('/');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
      this.error = errorMessage;
      throw err;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  logout(): void {
    // Segnala al backend che l'utente è offline prima di rimuovere il token
    apiService.signalOffline().catch(err => {
      console.error('Failed to signal offline on logout:', err);
    });
    
    apiService.removeToken();
    this.user = null;
    this.error = null;
    this.successMessage = null;
    
    // Pulisci tutti i dati utente dal localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('mail');
    localStorage.removeItem('walletAddress');
    
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
