export class ImageUploadService {
  static async uploadProfileImage(file: File, userId?: string | number): Promise<string> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch('/api/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data && data.imageUrl) return data.imageUrl;
    if (userId !== undefined && userId !== null) return ImageUploadService.getProfileImageUrl(userId);
    return '';
  }

  static validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Formato file non supportato. Usa JPEG, PNG, GIF o WebP.';
    }

    if (file.size > maxSize) {
      return 'Il file è troppo grande. Massimo 5MB.';
    }

    return null;
  }

  static previewImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

    static getProfileImageUrl(userId: string | number, avoidCache = true): string {
      const ts = avoidCache ? `?t=${Date.now()}` : '';
      return `/api/avatar/${userId}${ts}`;
    }

    static async fetchProfileImageObjectUrl(userId: string | number): Promise<string | null> {
      try {
        const res = await fetch(`/api/avatar/${userId}`);
        if (!res.ok) return null;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch (e) {
        return null;
      }
    }
}
