import { Route } from '../types/index.js';

export class Router {
  private routes: Route[] = [];
  private currentPath: string = '/';

  constructor() {
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
    
    this.currentPath = window.location.pathname;
  }

  addRoute(path: string, handler: () => void, requiresAuth: boolean = false): void {
    this.routes.push({ path, handler, requiresAuth });
  }

  navigate(path: string): void {
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute(): void {
    const route = this.routes.find(r => r.path === this.currentPath);
    if (route) {
      route.handler();
    } else {
      this.navigate('/');
    }
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  start(): void {
    this.handleRoute();
  }
}

export const router = new Router();
