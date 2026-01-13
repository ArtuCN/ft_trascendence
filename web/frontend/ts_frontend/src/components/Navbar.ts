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
      'text-white font-bold text-lg hover:text-cyan-300 transition-colors px-6 py-2 rounded border-2 border-cyan-400',
      () => router.navigate('/')
    );
    logoButton.style.color = '#9BE7FF';
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
      'text-white font-bold px-6 py-2 rounded transition-all focus:outline-none border-2 border-pink-400 hover:bg-pink-500/20',
      async () => await this.profileModal.show()
    );
    profileButton.style.color = '#FF6EC7';

    const socialButton = createButton(
      'SOCIAL',
      'text-white font-bold px-6 py-2 rounded transition-all focus:outline-none border-2 border-pink-400 hover:bg-pink-500/20',
      async () => await this.socialModal.show()
    );
    socialButton.style.color = '#FF6EC7';
	
    const chatButton = createButton(
      'CHAT',
      'text-white font-bold px-6 py-2 rounded transition-all focus:outline-none border-2 border-cyan-400 hover:bg-cyan-500/20',
      () => router.navigate('/live-chat')
    );
    chatButton.style.color = '#9BE7FF';

    const logoutButton = createButton(
      'LOGOUT',
      'text-white font-bold px-6 py-2 rounded transition-all focus:outline-none border-2 border-pink-400 hover:bg-pink-500/20',
      () => {
        authState.logout();
        router.navigate('/');
      }
    );
    logoutButton.style.color = '#FF6EC7';

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
