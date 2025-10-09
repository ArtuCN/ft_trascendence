import { createElement } from '../utils/dom.js';
import { ImageUploadService } from '../services/imageUpload.js';
import { authState } from '../state/auth.js';

export class ProfileImageUpload {
  private element: HTMLElement;
  private imagePreview!: HTMLImageElement;
  private fileInput!: HTMLInputElement;
  private isUploading: boolean = false;
  private onImageUploaded?: (imageUrl: string) => void;

  constructor(currentImageUrl?: string, onImageUploaded?: (imageUrl: string) => void) {
    this.onImageUploaded = onImageUploaded;
    this.element = this.createElement(currentImageUrl);
  }

  private createElement(currentImageUrl?: string): HTMLElement {
    const container = createElement('div', {
      className: 'w-20 h-20 rounded-lg flex items-center justify-center border-4 border-orange-500 bg-gray-700 cursor-pointer hover:bg-gray-600 transition-all group relative overflow-hidden'
    });

    this.imagePreview = createElement('img', {
      className: 'w-full h-full object-cover',
      src: currentImageUrl || '',
      alt: 'Profile Image',
      style: currentImageUrl ? 'display: block;' : 'display: none;'
    }) as HTMLImageElement;

    const defaultIcon = createElement('div', {
      className: 'text-white font-bold text-2xl flex items-center justify-center w-full h-full',
      innerHTML: 'IMG',
      style: currentImageUrl ? 'display: none;' : 'display: flex;'
    });

    const hoverOverlay = createElement('div', {
      className: 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
      innerHTML: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>`
    });

    this.fileInput = createElement('input', {
      type: 'file',
      accept: 'image/*',
      className: 'hidden'
    }) as HTMLInputElement;
    
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    container.addEventListener('click', () => this.fileInput.click());

    container.appendChild(this.imagePreview);
    container.appendChild(defaultIcon);
    container.appendChild(hoverOverlay);
    container.appendChild(this.fileInput);

    return container;
  }

  private async handleFileSelect(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const validationError = ImageUploadService.validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const previewUrl = await ImageUploadService.previewImage(file);
      this.updateImageDisplay(previewUrl, true);
      
      await this.uploadImage(file);
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Errore durante la gestione del file');
    }
  }

  private async uploadImage(file?: File): Promise<void> {
    const fileToUpload = file || this.fileInput.files?.[0];
    if (!fileToUpload || this.isUploading) return;

    this.isUploading = true;
    this.showLoadingState();

    try {
      const imageUrl = await ImageUploadService.uploadProfileImage(fileToUpload);
      
      const currentUser = authState.getState().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, profileImage: imageUrl };
        authState.updateUser(updatedUser);
      }

      this.updateImageDisplay(imageUrl, false);

      if (this.onImageUploaded) {
        this.onImageUploaded(imageUrl);
      }

      alert('Immagine caricata con successo!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Errore durante il caricamento dell\'immagine');
      this.resetToDefaultState();
    } finally {
      this.isUploading = false;
    }
  }

  private updateImageDisplay(imageUrl: string, isPreview: boolean): void {
    this.imagePreview.src = imageUrl;
    this.imagePreview.style.display = 'block';
    
    const defaultIcon = this.element.querySelector('div[innerHTML*="IMG"]') as HTMLElement;
    if (defaultIcon) {
      defaultIcon.style.display = 'none';
    }
  }

  private showLoadingState(): void {
    const overlay = this.element.querySelector('.group-hover\\:opacity-100') as HTMLElement;
    if (overlay) {
      overlay.innerHTML = `<svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>`;
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    }
  }

  private resetToDefaultState(): void {
    const overlay = this.element.querySelector('.opacity-100') as HTMLElement;
    if (overlay) {
      overlay.innerHTML = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>`;
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }

  updateImage(imageUrl: string): void {
    this.imagePreview.src = imageUrl;
  }

  destroy(): void {
    this.fileInput.removeEventListener('change', this.handleFileSelect);
  }
}
