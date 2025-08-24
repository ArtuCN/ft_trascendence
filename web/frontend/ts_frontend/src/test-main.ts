import { createElement } from './utils/dom.js';

console.log('Starting basic app...');

// Avvia tutto quando il DOM è pronto (aspettiamo che sia tutto caricato)
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded...');
  
  try {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App element not found');
      return;
    }

    // Creiamo un elemento di test per vedere se funziona tutto
    const testDiv = createElement('div', {
      className: 'p-4 bg-blue-500 text-white',
      innerHTML: 'Test Application - TypeScript Working!'
    });

    app.appendChild(testDiv);
    console.log('Test app rendered successfully');
    
  } catch (error) {
    console.error('Error in basic app:', error);
  }
});
