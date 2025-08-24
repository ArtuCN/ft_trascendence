import { createElement, renderTo } from './utils/dom.js';
import { router } from './router/router.js';
import { authState } from './state/auth.js';
import { Navbar } from './components/Navbar.js';
import { AuthGuard } from './components/AuthGuard.js';
import { HomePage } from './pages/HomePage.js';
import { PlayPage } from './pages/PlayPage.js';

export class App {
  private navbar: Navbar;
  private authGuard: AuthGuard;
  private mainContent: HTMLElement;
  private currentPage?: { destroy(): void };
  private unsubscribe?: () => void;

  constructor() {
    this.mainContent = this.initializeDOM();
    this.navbar = new Navbar();
    this.authGuard = new AuthGuard(this.mainContent);
    this.setupRoutes();
    this.bindAuthState();
    
    document.body.appendChild(this.navbar.getElement());
    
    router.start();
  }

  private initializeDOM(): HTMLElement {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App element not found');
    }

    const layout = createElement('div', {
      className: 'min-h-screen bg-gray-100'
    });

    const mainContent = createElement('div', {
      className: 'ml-44 p-8 min-h-screen'
    });

    layout.appendChild(mainContent);
    renderTo(layout, app);

    return mainContent;
  }

  private setupRoutes(): void {
    router.addRoute('/', () => this.renderPage(new HomePage()));
    router.addRoute('/play', () => this.renderPage(new PlayPage()));
  }

  private bindAuthState(): void {
    this.unsubscribe = authState.subscribe(() => {
      const { isAuthenticated } = authState.getState();
      
      if (isAuthenticated) {
        this.mainContent.style.display = 'block';
      } else {
        this.mainContent.style.display = 'none';
      }
    });
  }

  private renderPage(page: { getElement(): HTMLElement; destroy(): void }): void {
    const { isAuthenticated } = authState.getState();
    
    if (this.currentPage) {
      this.currentPage.destroy();
    }

    this.currentPage = page;

    if (isAuthenticated) {
      this.authGuard.setContent(page.getElement());
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    this.navbar.destroy();
    this.authGuard.destroy();
    
    if (this.currentPage) {
      this.currentPage.destroy();
    }
  }
}
