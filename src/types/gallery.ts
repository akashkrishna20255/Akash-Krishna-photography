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

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface SiteContent {
  hero: {
    name: string;
    tagline: string;
    headline: string;
    headlineAccent: string;
    bio: string;
    showFullscreenBg: boolean;
    fullscreenBgUrl: string;
    bgOverlayOpacity: number; // 0 to 100
  };
  about: {
    badge: string;
    title: string;
    bio1: string;
    bio2: string;
    portraitUrl: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    skillBrand: string;
    skillPost: string;
    skillMotion: string;
  };
  services: ServiceItem[];
  contact: {
    badge: string;
    headline: string;
    subtext: string;
    email: string;
    availabilityText: string;
  };
  layout: {
    galleryDefaultView: 'grid3' | 'grid2' | 'feed';
    showServices: boolean;
    showAbout: boolean;
  };
}
