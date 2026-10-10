export type CategoryType = 'All' | 'Visual Design' | 'Film & Motion' | 'Photography' | 'Editorial';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: CategoryType;
  imageUrl: string;
  year: string;
  description?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export interface AdminSettings {
  adminKey: string;
  adminEmail: string;
  isLoggedIn: boolean;
}
