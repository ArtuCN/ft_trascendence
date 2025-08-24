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
      className: 'fixed left-0 top-0 h-full w-44 py-6 px-4 flex flex-col shadow-lg z-50',
      style: 'background-color: #3B2E27;'
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
    logoButton.style.color = '#E67923';
    
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
      () => this.profileModal.show()
    );
    profileButton.style.backgroundColor = '#E67923';
    profileButton.addEventListener('mouseenter', () => {
      profileButton.style.backgroundColor = '#D16A1E';
    });
    profileButton.addEventListener('mouseleave', () => {
      profileButton.style.backgroundColor = '#E67923';
    });

    const playButton = createButton(
      'Play',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-orange-500 hover:bg-orange-600 focus:outline-none',
      () => router.navigate('/play')
    );

    const socialButton = createButton(
      'Social',
      'text-white px-3 py-2 rounded-md transition-all w-full text-center bg-orange-500 hover:bg-orange-600 focus:outline-none',
      () => this.socialModal.show()
    );

    const logoutButton = createButton(
      'Logout',
      'text-white px-3 py-2 rounded transition-all focus:outline-none w-full text-center',
      () => {
        authState.logout();
        router.navigate('/');
      }
    );
    logoutButton.style.backgroundColor = '#6B7280';
    logoutButton.addEventListener('mouseenter', () => {
      logoutButton.style.backgroundColor = '#4B5563';
    });
    logoutButton.addEventListener('mouseleave', () => {
      logoutButton.style.backgroundColor = '#6B7280';
    });

    container.appendChild(greeting);
    container.appendChild(profileButton);
    container.appendChild(playButton);
    container.appendChild(socialButton);
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
