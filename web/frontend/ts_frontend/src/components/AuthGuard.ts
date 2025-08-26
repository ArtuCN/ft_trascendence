import { authState } from '../state/auth.js';
import { AuthModal } from './AuthModal.js';
import { renderTo } from '../utils/dom.js';

export class AuthGuard {
  private authModal: AuthModal;
  private currentContent?: HTMLElement;
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.authModal = new AuthModal(false);
    this.bindAuthState();
    this.checkAuthState();
  }

  private bindAuthState(): void {
    this.unsubscribe = authState.subscribe(() => {
      this.checkAuthState();
    });
  }

  private checkAuthState(): void {
    const { isAuthenticated, isLoading } = authState.getState();
    
    if (isLoading) {
      this.showLoading();
    } else if (!isAuthenticated) {
      this.authModal.show();
    } else {
      this.authModal.hide();
    }
  }

  private showLoading(): void {
  }

  setContent(content: HTMLElement): void {
    const { isAuthenticated } = authState.getState();
    
    if (isAuthenticated) {
      this.currentContent = content;
      renderTo(content, this.container);
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.authModal.destroy();
  }
}
