import { createElement, renderTo } from './utils/dom.js';
import { router } from './router/router.js';
import { authState } from './state/auth.js';
import { Navbar } from './components/Navbar.js';
import { AuthGuard } from './components/AuthGuard.js';
import { HomePage } from './pages/HomePage.js';
import { PlayPage } from './pages/PlayPage.js';
import { PlayPage3D } from './pages/PlayPage3D.js';
import { LiveChatPage } from './pages/LiveChatPage.js';

export class App {
  private navbar: Navbar;
  private authGuard: AuthGuard;
  private mainContent: HTMLElement;
  private layout: HTMLElement;
  private currentPage?: { destroy(): void };
  private unsubscribe?: () => void;

  constructor() {
    this.navbar = new Navbar();
    const { layout, mainContent } = this.initializeDOM();
    this.layout = layout;
    this.mainContent = mainContent;
    this.authGuard = new AuthGuard(this.mainContent);
    
    // Nascondi navbar e content di default (prima del login)
    const { isAuthenticated } = authState.getState();
    if (!isAuthenticated) {
      this.navbar.getElement().style.display = 'none';
      this.mainContent.style.display = 'none';
    }
    
    this.setupRoutes();
    this.bindAuthState();
    
    router.start();
  }

  private initializeDOM(): { layout: HTMLElement; mainContent: HTMLElement } {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App element not found');
    }

    // Layout principale con flexbox orizzontale
    const layout = createElement('div', {
      className: 'min-h-screen bg-gray-100 flex'
    });

    // Container per il contenuto principale (senza margin-left)
    const mainContent = createElement('div', {
      className: 'flex-1 p-8 min-h-screen'
    });

    // Aggiungiamo la navbar e il contenuto principale al layout
    layout.appendChild(this.navbar.getElement());
    layout.appendChild(mainContent);
    
    renderTo(layout, app);

    return { layout, mainContent };
  }

  private setupRoutes(): void {
    router.addRoute('/', () => this.renderPage(new HomePage()));
    router.addRoute('/play', () => this.renderPage(new PlayPage()));
    router.addRoute('/play3D', () => this.renderPage(new PlayPage3D()));
    router.addRoute('/live-chat', () => this.renderPage(new LiveChatPage()));
  }

  private bindAuthState(): void {
    this.unsubscribe = authState.subscribe(() => {
      const { isAuthenticated } = authState.getState();
      
      if (isAuthenticated) {
        this.mainContent.style.display = 'block';
        this.navbar.getElement().style.display = 'flex';
      } else {
        this.mainContent.style.display = 'none';
        this.navbar.getElement().style.display = 'none';
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
