import { createElement } from '../utils/dom.js';

export class HomePage {
  private element: HTMLElement;

  constructor() {
    this.element = this.createPage();
  }

  private createPage(): HTMLElement {
    const container = createElement('div', {
      className: 'p-6'
    });

    const title = createElement('h1', {
      className: 'text-3xl font-bold text-gray-800 mb-6',
      innerHTML: 'Benvenuto a ft_transcendence'
    });

    const mainCard = createElement('div', {
      className: 'bg-white rounded-lg shadow-md p-6'
    });

    const featuresGrid = createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'
    });

    const features = [
      { title: 'Feature 1', bgClass: 'bg-blue-50', textClass: 'text-blue-800' },
      { title: 'Feature 2', bgClass: 'bg-green-50', textClass: 'text-green-800' },
      { title: 'Feature 3', bgClass: 'bg-purple-50', textClass: 'text-purple-800' }
    ];

    features.forEach(feature => {
      const featureCard = createElement('div', {
        className: `${feature.bgClass} p-4 rounded-lg`
      });

      const featureTitle = createElement('h3', {
        className: `font-semibold ${feature.textClass}`,
        innerHTML: feature.title
      });

      featureCard.appendChild(featureTitle);
      featuresGrid.appendChild(featureCard);
    });

    mainCard.appendChild(featuresGrid);
    container.appendChild(title);
    container.appendChild(mainCard);

    return container;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
  }
}
