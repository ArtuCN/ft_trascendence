export class ImageUploadService {
  static async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch('/api/user/upload-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
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
}
