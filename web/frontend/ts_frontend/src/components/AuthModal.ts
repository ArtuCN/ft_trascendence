import { createElement, createButton, createInput } from '../utils/dom.js';
import { authState } from '../state/auth.js';

const COLORS = {
  primary: '#E67923',
  error: '#DC2626',
  errorHover: '#D32F2F',
  dark: '#2A2A2A',
  darkText: '#3C3C3C',
  loginButton: '#B20000',
  loginButtonHover: '#D32F2F',
  inputBg: '#f9fafb',
  white: '#ffffff',
  lightGray: '#f5f5f5'
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TabType = 'login' | 'register';

export class AuthModal {
  private isVisible: boolean = false;
  private modalElement?: HTMLElement;
  private activeTab: TabType = 'login';
  private formData = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };
  private errors: { [key: string]: string } = {};
  private showCloseButton: boolean = true;
  private unsubscribe?: () => void;

  constructor(showCloseButton: boolean = true) {
    this.showCloseButton = showCloseButton;
    this.bindAuthState();
  }

  private bindAuthState(): void {
    this.unsubscribe = authState.subscribe(() => {
      this.updateErrorDisplay();
    });
  }

  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
  }

  hide(): void {
    if (!this.isVisible || !this.modalElement) return;
    
    this.isVisible = false;
    document.body.removeChild(this.modalElement);
    this.modalElement = undefined;
    this.resetForm();
  }

  private createModal(): HTMLElement {
    const overlay = createElement('div', {
      className: 'fixed inset-0 flex items-center justify-center z-50'
    });

    if (this.showCloseButton) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    const modal = createElement('div', {
      className: 'bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 h-[500px] overflow-hidden flex flex-col',
      style: `background-color: ${COLORS.dark};`
    });

    modal.addEventListener('click', (e) => e.stopPropagation());

    // L'header con il bottoncino per chiudere tutto
    if (this.showCloseButton) {
      const header = createElement('div', {
        className: 'relative px-6 pt-4 pb-4'
      });

      const closeButton = createButton(
        '×',
        'absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none text-2xl',
        () => this.hide()
      );
      closeButton.style.color = COLORS.primary;

      header.appendChild(closeButton);
      modal.appendChild(header);
    }

    // Le tab per passare da login a registrazione
    const tabsContainer = this.createTabs();
    modal.appendChild(tabsContainer);

    // Tutto il contenuto del form
    const formContainer = createElement('div', {
      className: 'flex-1 flex flex-col'
    });

    const form = this.createForm();
    formContainer.appendChild(form);
    modal.appendChild(formContainer);

    overlay.appendChild(modal);
    return overlay;
  }

  private createTabs(): HTMLElement {
    const container = createElement('div', {
      className: 'px-6 mt-4'
    });

    const tabs = [
      { id: 'login' as const, label: 'Log In' },
      { id: 'register' as const, label: 'Sign Up' }
    ];

    tabs.forEach(tab => {
      const button = createButton(
        tab.label,
        'pb-3 px-1 text-lg font-semibold border-b-2 transition-all mr-8 focus:outline-none hover:opacity-70',
        () => this.switchTab(tab.id)
      );

      button.style.color = this.activeTab === tab.id ? COLORS.primary : COLORS.darkText;
      button.style.borderBottomColor = this.activeTab === tab.id ? COLORS.primary : 'transparent';

      container.appendChild(button);
    });

    return container;
  }

  private createForm(): HTMLElement {
    const form = createElement('form', {
      className: 'flex flex-col gap-5 pt-4 px-8 pb-6 flex-1 min-h-[300px] items-center'
    });

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // I messaggi di errore o successo (quando qualcosa va storto o bene)
    const messageContainer = createElement('div', {
      className: 'w-full max-w-sm mb-4'
    });
    this.updateMessageContainer(messageContainer);

    // Tutti i campi del form (email, password, etc.)
    const fieldsContainer = createElement('div', {
      className: 'flex flex-col gap-6 flex-grow w-full max-w-sm'
    });

    // Il campo email (fondamentale per entrare)
    fieldsContainer.appendChild(this.createField('email', 'Email Address', 'email', 'Enter your email address...'));

    // Il campo username (solo quando ti registri)
    if (this.activeTab === 'register') {
      fieldsContainer.appendChild(this.createField('username', 'Username', 'text', 'Enter your username...'));
    }

    // Il campo password (segreto!)
    fieldsContainer.appendChild(this.createField('password', 'Password', 'password', 
      this.activeTab === 'login' ? 'Enter your password...' : 'Create a password...'));

    // Conferma password (solo in registrazione per non sbagliare)
    if (this.activeTab === 'register') {
      fieldsContainer.appendChild(this.createField('confirmPassword', 'Confirm Password', 'password', 'Confirm your password...'));
    }

    // Un po' di spazio per far respirare il form del login
    if (this.activeTab === 'login') {
      fieldsContainer.appendChild(createElement('div', { className: 'h-16' }));
    }

    // La linea divisoria con "or" nel mezzo
    const divider = this.createDivider();

    // I bottoni per inviare il form e quello di Google
    const buttonsContainer = this.createButtons();

    form.appendChild(messageContainer);
    form.appendChild(fieldsContainer);
    form.appendChild(divider);
    form.appendChild(buttonsContainer);

    return form;
  }

  private createField(fieldName: string, label: string, type: string, placeholder: string): HTMLElement {
    const container = createElement('div', {
      className: 'flex flex-col items-center'
    });

    const labelEl = createElement('label', {
      className: 'block text-sm font-medium text-white text-center mb-2 w-full',
      innerHTML: label
    });

    const input = createInput(type, placeholder, 
      `w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500 ${
        this.errors[fieldName] ? 'border-red-500' : 'border-gray-700'
      } bg-gray-100`
    );

    input.value = this.formData[fieldName as keyof typeof this.formData];
    input.addEventListener('input', (e) => this.handleInputChange(fieldName, (e.target as HTMLInputElement).value));

    const errorEl = createElement('p', {
      className: 'text-red-500 text-sm mt-1 text-center',
      innerHTML: this.errors[fieldName] || ''
    });

    container.appendChild(labelEl);
    container.appendChild(input);
    if (this.errors[fieldName]) {
      container.appendChild(errorEl);
    }

    return container;
  }

  private createDivider(): HTMLElement {
    const container = createElement('div', {
      className: 'relative my-6 w-full max-w-sm'
    });

    const line = createElement('div', {
      className: 'absolute inset-0 flex items-center'
    });

    const lineDiv = createElement('div', {
      className: 'w-full border-t',
      style: `border-color: ${COLORS.darkText};`
    });

    const textContainer = createElement('div', {
      className: 'relative flex justify-center text-sm'
    });

    const text = createElement('span', {
      className: 'px-4 text-white',
      innerHTML: 'or',
      style: `background-color: ${COLORS.dark};`
    });

    line.appendChild(lineDiv);
    textContainer.appendChild(text);
    container.appendChild(line);
    container.appendChild(textContainer);

    return container;
  }

  private createButtons(): HTMLElement {
    const container = createElement('div', {
      className: 'mt-auto w-full max-w-sm'
    });

    const buttonsRow = createElement('div', {
      className: 'flex gap-3 mb-4 h-12'
    });

    // Il bottone principale per inviare tutto
    const { isLoading } = authState.getState();
    const submitButton = createButton(
      isLoading ? 'Loading...' : (this.activeTab === 'login' ? 'Log in' : 'Create Account'),
      'flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center focus:outline-none disabled:opacity-50',
      () => this.handleFormSubmit()
    );
    submitButton.style.backgroundColor = COLORS.loginButton;
    submitButton.disabled = isLoading;

    submitButton.addEventListener('mouseenter', () => {
      if (!isLoading) {
        submitButton.style.backgroundColor = COLORS.loginButtonHover;
      }
    });
    submitButton.addEventListener('mouseleave', () => {
      if (!isLoading) {
        submitButton.style.backgroundColor = COLORS.loginButton;
      }
    });

    // Il bottone di Google (per chi preferisce la strada facile)
    const googleButton = this.createGoogleButton();

    buttonsRow.appendChild(submitButton);
    buttonsRow.appendChild(googleButton);
    container.appendChild(buttonsRow);

    return container;
  }

  private createGoogleButton(): HTMLElement {
    const button = createButton(
      `<svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google`,
      'flex items-center justify-center px-4 py-3 border rounded-lg font-semibold cursor-pointer h-12 whitespace-nowrap transition-all focus:outline-none text-black'
    );

    button.style.backgroundColor = COLORS.white;
    button.style.borderColor = COLORS.darkText;
    button.style.color = '#000000';

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = COLORS.lightGray;
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = COLORS.white;
    });

    return button;
  }

  private handleInputChange(field: string, value: string): void {
    this.formData[field as keyof typeof this.formData] = value;
    
    // Rimuovi l'errore dal campo se c'era
    if (this.errors[field]) {
      delete this.errors[field];
    }

    // Pulisci anche gli errori di autenticazione
    authState.clearError();
    authState.clearSuccessMessage();
  }

  private switchTab(tab: TabType): void {
    this.activeTab = tab;
    this.resetForm();
    this.refreshModal();
  }

  private resetForm(): void {
    this.formData = {
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
    this.errors = {};
  }

  private refreshModal(): void {
    if (this.modalElement && this.modalElement.parentNode) {
      const newModal = this.createModal();
      this.modalElement.parentNode.replaceChild(newModal, this.modalElement);
      this.modalElement = newModal;
    }
  }

  private updateMessageContainer(container: HTMLElement): void {
    const { error, successMessage } = authState.getState();
    
    container.innerHTML = '';
    
    if (error) {
      const errorEl = createElement('p', {
        className: 'text-red-500 text-sm text-center bg-red-100 p-2 rounded',
        innerHTML: error
      });
      container.appendChild(errorEl);
    }
    
    if (successMessage) {
      const successEl = createElement('p', {
        className: 'text-green-500 text-sm text-center bg-green-100 p-2 rounded',
        innerHTML: successMessage
      });
      container.appendChild(successEl);
    }
  }

  private updateErrorDisplay(): void {
    // Questa funzione viene chiamata quando cambia lo stato di autenticazione
    if (this.modalElement) {
      const messageContainer = this.modalElement.querySelector('.w-full.max-w-sm.mb-4') as HTMLElement;
      if (messageContainer) {
        this.updateMessageContainer(messageContainer);
      }
    }
  }

  private validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!EMAIL_REGEX.test(this.formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (this.activeTab === 'register' && !this.formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (this.formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (this.activeTab === 'register' && this.formData.password !== this.formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    this.handleFormSubmit();
  }

  private async handleFormSubmit(): Promise<void> {
    if (!this.validateForm()) {
      this.refreshModal();
      return;
    }

    try {
      if (this.activeTab === 'login') {
        await authState.login(this.formData.email, this.formData.password);
      } else {
        await authState.register(this.formData.email, this.formData.username, this.formData.password);
      }
      
      // Successo - chiudi il modal
      this.hide();
    } catch (err) {
      // Gli errori vengono gestiti nello stato di autenticazione
      console.error('Auth error:', err);
    }
  }

  destroy(): void {
    this.hide();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
