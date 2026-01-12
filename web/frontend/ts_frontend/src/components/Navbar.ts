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
      className: 'min-h-screen w-44 py-6 px-4 flex flex-col shadow-lg',
      // Fruitiger / Aero inspired cool-blue palette
      style: 'background: linear-gradient(180deg, #062A3A 0%, #0B4F6C 100%);'
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

    const logoContainer = createElement('div', { className: 'mb-8' });
    const logoButton = createButton(
      `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
      <span class="text-sm">Home</span>`,
      'text-white font-semibold text-lg flex flex-col items-center gap-2 hover:text-orange-300 transition-colors w-full p-4',
      () => router.navigate('/')
    );
    logoButton.style.color = '#9BE7FF';

    logoContainer.appendChild(logoButton);
    this.element.appendChild(logoContainer);

    const mainContainer = createElement('div', { className: 'flex-1 flex flex-col justify-center' });
    
    if (user) {
      mainContainer.appendChild(this.createAuthenticatedButtons(user));
    }
    
    this.element.appendChild(mainContainer);
  }

  private createAuthenticatedButtons(user: any): HTMLElement {
    const container = createElement('div', { className: 'flex flex-col gap-4 w-full' });

    const greeting = createElement('div', {
      className: 'text-white text-center text-sm mb-4 px-2',
      innerHTML: `Ciao, ${user.username}!`
    });

    const profileButton = createButton(
      'Profilo',
      'text-white px-3 py-2 rounded transition-all focus:outline-none w-full text-center',
      async () => await this.profileModal.show()
    );
    profileButton.style.backgroundColor = '#00B4D8';
    profileButton.addEventListener('mouseenter', () => {
      profileButton.style.backgroundColor = '#0096C7';
    });
    profileButton.addEventListener('mouseleave', () => {
      profileButton.style.backgroundColor = '#00B4D8';
    });

    const playButton = createButton(
      'Play',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-sky-500 hover:bg-sky-600 focus:outline-none',
      () => router.navigate('/play')
    );

    const play3dButton = createButton(
      'Play 3D',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-sky-500 hover:bg-sky-600 focus:outline-none',
      () => router.navigate('/play3D')
    );

    const socialButton = createButton(
      'Social',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-sky-400 hover:bg-sky-500 focus:outline-none',
      async () => await this.socialModal.show()
    );
	
    const chatButton = createButton(
      'Chat',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-sky-500 hover:bg-sky-600 focus:outline-none',
      () => router.navigate('/live-chat')
    );

    const logoutButton = createButton(
      'Logout',
      'text-white px-3 py-2 rounded transition-all focus:outline-none w-full text-center',
      () => {
        authState.logout();
        router.navigate('/');
      }
    );
    logoutButton.style.backgroundColor = '#334E68';
    logoutButton.addEventListener('mouseenter', () => {
      logoutButton.style.backgroundColor = '#2B5A78';
    });
    logoutButton.addEventListener('mouseleave', () => {
      logoutButton.style.backgroundColor = '#334E68';
    });

    container.appendChild(greeting);
    container.appendChild(profileButton);
    container.appendChild(playButton);
    container.appendChild(play3dButton);
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
