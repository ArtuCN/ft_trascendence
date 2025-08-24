export function createElement(
  tag: string, 
  attributes: Record<string, string> = {}, 
  children: (HTMLElement | string)[] = []
): HTMLElement {
  const element = document.createElement(tag);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      (element as any)[key] = value;
    });
  }

  if (children && children.length > 0 && !attributes?.innerHTML) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }  return element;
}

export function createButton(
  text: string, 
  className: string = '', 
  onClick?: () => void
): HTMLButtonElement {
  const button = createElement('button', { 
    className: `${className} focus:outline-none`,
    innerHTML: text
  }) as HTMLButtonElement;
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

export function createInput(
  type: string = 'text', 
  placeholder: string = '', 
  className: string = ''
): HTMLInputElement {
  return createElement('input', {
    type,
    placeholder,
    className: `${className} focus:outline-none`
  }) as HTMLInputElement;
}

export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function renderTo(element: HTMLElement, container: HTMLElement): void {
  clearElement(container);
  container.appendChild(element);
}
