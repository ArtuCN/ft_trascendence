import { createElement, createButton } from '../utils/dom.js';

const COLORS = {
  primary: '#00B4D8',
  dark: '#2A2A2A',
  white: '#ffffff'
};

export class MatchmakingModal {
  private isVisible: boolean = false;
  private modalElement?: HTMLElement;
  private onCancel?: () => void;
  private animationInterval?: number;

  show(onCancel?: () => void): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.onCancel = onCancel;
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
    this.startAnimation();
  }

  hide(): void {
    if (!this.isVisible || !this.modalElement) return;
    
    this.isVisible = false;
    this.stopAnimation();
    document.body.removeChild(this.modalElement);
    this.modalElement = undefined;
  }

  private startAnimation(): void {
    let dots = 0;
    const statusText = this.modalElement?.querySelector('#matchmaking-status') as HTMLElement;
    
    this.animationInterval = window.setInterval(() => {
      if (statusText) {
        dots = (dots + 1) % 4;
        statusText.textContent = 'Ricerca avversario in corso' + '.'.repeat(dots);
      }
    }, 500);
  }

  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
  }

  private createModal(): HTMLElement {
    const overlay = createElement('div', {
      className: 'fixed inset-0 flex items-center justify-center z-50',
      style: 'background-color: rgba(0, 0, 0, 0.7);'
    });

    const modal = createElement('div', {
      className: 'bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden',
      style: `background-color: ${COLORS.dark};`
    });

    // Header
    const header = createElement('div', {
      className: 'p-6 border-b border-gray-700'
    });

    const title = createElement('h2', {
      className: 'text-2xl font-bold text-center',
      innerHTML: '🎮 Matchmaking',
      style: `color: ${COLORS.primary};`
    });

    header.appendChild(title);

    // Content
    const content = createElement('div', {
      className: 'p-8 text-center',
      style: `color: ${COLORS.white};`
    });

    // Spinner
    const spinnerContainer = createElement('div', {
      className: 'mb-6 flex justify-center'
    });

    const spinner = createElement('div', {
      className: 'animate-spin rounded-full h-16 w-16 border-b-4',
      style: `border-color: ${COLORS.primary};`
    });

    spinnerContainer.appendChild(spinner);

    // Status text
    const statusText = createElement('p', {
      id: 'matchmaking-status',
      className: 'text-lg mb-2',
      innerHTML: 'Ricerca avversario in corso...'
    });

    const helpText = createElement('p', {
      className: 'text-sm text-gray-400 mb-6',
      innerHTML: 'Attendere prego, ti collegheremo con un avversario online'
    });

    // Cancel button
    const cancelButton = createButton(
      'Annulla Ricerca',
      'w-full py-3 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity',
      () => this.handleCancel()
    );
    cancelButton.style.backgroundColor = '#EF4444'; // red-500

    content.appendChild(spinnerContainer);
    content.appendChild(statusText);
    content.appendChild(helpText);
    content.appendChild(cancelButton);

    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);

    return overlay;
  }

  private handleCancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.hide();
  }
}
