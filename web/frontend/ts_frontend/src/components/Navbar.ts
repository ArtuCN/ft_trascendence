import { createElement, createButton } from '../utils/dom.js';
import { authState } from '../state/auth.js';
import { router } from '../router/router.js';
import { ProfileModal } from './ProfileModal.js';
import { SocialModal } from './SocialModal.js';

export class Navbar {
  private element: HTMLElement;
  private profileModal: ProfileModal;
  private socialModal: SocialModal;
  private unsubscribe?: () => void;

  constructor() {
    this.profileModal = new ProfileModal();
    this.socialModal = new SocialModal();
    this.element = this.createNavbar();
    this.bindAuthState();
  }

  private bindAuthState(): void {
    this.unsubscribe = authState.subscribe(() => {
      this.updateNavbar();
    });
  }

  private createNavbar(): HTMLElement {
    const nav = createElement('nav', {
      className: 'w-full py-4 px-8 flex items-center justify-center shadow-lg',
      // Fruitiger / Aero inspired cool-blue palette
      style: 'background: linear-gradient(90deg, #062A3A 0%, #0B4F6C 100%);'
    });

    this.element = nav;
    this.updateNavbar();
    return nav;
  }

  private updateNavbar(): void {
    const { user } = authState.getState();
    
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }

    const mainContainer = createElement('div', { className: 'flex items-center gap-4' });
    
    const logoButton = createButton(
      'HOME',
      'text-white font-bold text-lg px-6 py-2 rounded-md transition-all transform hover:scale-105 uppercase tracking-wider',
      () => router.navigate('/')
    );
    logoButton.style.background = 'rgba(0, 229, 255, 0.1)';
    logoButton.style.borderColor = '#00e5ff';
    logoButton.style.borderWidth = '3px';
    logoButton.style.color = '#00e5ff';
    logoButton.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.6), inset 0 0 30px rgba(0, 229, 255, 0.15)';
    logoButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
    mainContainer.appendChild(logoButton);
    
    if (user) {
      const authButtons = this.createAuthenticatedButtons(user);
      while (authButtons.firstChild) {
        mainContainer.appendChild(authButtons.firstChild);
      }
    }
    
    this.element.appendChild(mainContainer);
  }

  private createAuthenticatedButtons(user: any): HTMLElement {
    const container = createElement('div', { className: 'flex items-center gap-4' });

    const profileButton = createButton(
      'PROFILE',
      'text-white font-bold px-6 py-2 rounded-md transition-all transform hover:scale-105 focus:outline-none uppercase tracking-wider',
      async () => await this.profileModal.show()
    );
    profileButton.style.background = 'rgba(255, 110, 199, 0.1)';
    profileButton.style.borderColor = '#ff6ec7';
    profileButton.style.borderWidth = '3px';
    profileButton.style.color = '#ff6ec7';
    profileButton.style.boxShadow = '0 0 30px rgba(255, 110, 199, 0.6), inset 0 0 30px rgba(255, 110, 199, 0.15)';
    profileButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';

    const socialButton = createButton(
      'SOCIAL',
      'text-white font-bold px-6 py-2 rounded-md transition-all transform hover:scale-105 focus:outline-none uppercase tracking-wider',
      async () => await this.socialModal.show()
    );
    socialButton.style.background = 'rgba(255, 110, 199, 0.1)';
    socialButton.style.borderColor = '#ff6ec7';
    socialButton.style.borderWidth = '3px';
    socialButton.style.color = '#ff6ec7';
    socialButton.style.boxShadow = '0 0 30px rgba(255, 110, 199, 0.6), inset 0 0 30px rgba(255, 110, 199, 0.15)';
    socialButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
	
    const chatButton = createButton(
      'CHAT',
      'text-white font-bold px-6 py-2 rounded-md transition-all transform hover:scale-105 focus:outline-none uppercase tracking-wider',
      () => router.navigate('/live-chat')
    );
    chatButton.style.background = 'rgba(0, 229, 255, 0.1)';
    chatButton.style.borderColor = '#00e5ff';
    chatButton.style.borderWidth = '3px';
    chatButton.style.color = '#00e5ff';
    chatButton.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.6), inset 0 0 30px rgba(0, 229, 255, 0.15)';
    chatButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';

    const logoutButton = createButton(
      'LOGOUT',
      'text-white font-bold px-6 py-2 rounded-md transition-all transform hover:scale-105 focus:outline-none uppercase tracking-wider',
      () => {
        authState.logout();
        router.navigate('/');
      }
    );
    logoutButton.style.background = 'rgba(255, 110, 199, 0.1)';
    logoutButton.style.borderColor = '#ff6ec7';
    logoutButton.style.borderWidth = '3px';
    logoutButton.style.color = '#ff6ec7';
    logoutButton.style.boxShadow = '0 0 30px rgba(255, 110, 199, 0.6), inset 0 0 30px rgba(255, 110, 199, 0.15)';
    logoutButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';

    container.appendChild(profileButton);
    container.appendChild(socialButton);
    container.appendChild(chatButton);
    container.appendChild(logoutButton);

    return container;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.profileModal.destroy();
    this.socialModal.destroy();
  }
}
