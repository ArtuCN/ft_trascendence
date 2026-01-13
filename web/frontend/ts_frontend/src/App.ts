import { createElement, renderTo } from './utils/dom.js';
import { router } from './router/router.js';
import { authState } from './state/auth.js';
import { Navbar } from './components/Navbar.js';
import { AuthGuard } from './components/AuthGuard.js';
import { HomePage } from './pages/HomePage.js';
import { PlayPage } from './pages/PlayPage.js';
import { PlayPage3D } from './pages/PlayPage3D.js';
import { LiveChatPage } from './pages/LiveChatPage.js';
import { apiService } from './services/api.js';

export class App {
  private navbar: Navbar;
  private authGuard: AuthGuard;
  private mainContent: HTMLElement;
  private layout: HTMLElement;
  private currentPage?: { destroy(): void };
  private unsubscribe?: () => void;

  constructor() {
    // Invalida cache stats al caricamento dell'app (refresh)
    apiService.clearStatsCache();
    
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
    } else {
      // Se già autenticato, avvia heartbeat
      apiService.startHeartbeat();
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

    // Layout principale con flexbox verticale (navbar in alto)
    const layout = createElement('div', {
      className: 'min-h-screen bg-gray-100 flex flex-col'
    });

    // Container per il contenuto principale
    const mainContent = createElement('div', {
      className: 'flex-1 min-h-screen',
      style: 'background: linear-gradient(180deg, #001F3F 0%, #003D73 100%);'
    });

    // Aggiungiamo la navbar e il contenuto principale al layout
    layout.appendChild(this.navbar.getElement());
    layout.appendChild(mainContent);
    
    renderTo(layout, app);

    return { layout, mainContent };
  }

  private setupRoutes(): void {
    router.addRoute('/', () => {
      const homePage = new HomePage();
      this.renderPage(homePage);
      // Carica leaderboards solo al primo accesso alla home
      homePage.ensureLeaderboardsLoaded();
    });
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
        // Avvia heartbeat quando l'utente si autentica
        apiService.startHeartbeat();
      } else {
        this.mainContent.style.display = 'none';
        this.navbar.getElement().style.display = 'none';
        // Ferma heartbeat al logout
        apiService.stopHeartbeat();
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
    
    // Ferma heartbeat quando l'app viene distrutta
    apiService.stopHeartbeat();
    
    this.navbar.destroy();
    this.authGuard.destroy();
    
    if (this.currentPage) {
      this.currentPage.destroy();
    }
  }
}
