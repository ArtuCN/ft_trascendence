import { authState } from '../state/auth.js';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
    googleAuthCallback: (response: any) => void;
  }
}

const GOOGLE_CLIENT_ID = '575747097249-3bu3g738p6s49pisr9ael83r4p5p1urv.apps.googleusercontent.com';

export class GoogleAuthService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Imposta il callback globale
      window.googleAuthCallback = this.handleCredentialResponse.bind(this);

      // Carica Google Identity Services se non è già caricato
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          this.initializeGoogleAuth();
          this.isInitialized = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      } else {
        this.initializeGoogleAuth();
        this.isInitialized = true;
        resolve();
      }
    });
  }

  private initializeGoogleAuth(): void {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.googleAuthCallback
    });
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      await authState.googleAuth(response.credential);
    } catch (error) {
      console.error('Google auth error:', error);
    }
  }

  renderButton(element: HTMLElement): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with'
    });
  }
}

export const googleAuthService = new GoogleAuthService();
