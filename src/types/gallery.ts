export type CategoryType = string;

export interface GalleryPhoto {
  id: string;
  title: string;
  category: CategoryType;
  imageUrl: string; // Primary cover photo
  images?: string[]; // Array of up to 10 showcase photos for the project
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

export interface SocialLink {
  id: string;
  name: string;
  url: string;
}

export interface SiteContent {
  categories?: string[]; // Dynamic customizable categories e.g. ['Visual Design', 'Film & Motion', 'Photography', 'Editorial']
  allCategoryLabel?: string; // Customizable label for "All" tab (default "All")
  hero: {
    name: string;
    tagline: string;
    headline: string;
    headlineAccent: string;
    headlineAccentSize?: 'small' | 'medium' | 'large';
    bio: string;
    showFullscreenBg: boolean;
    fullscreenBgUrl: string;
    bgOverlayOpacity: number; // 0 to 100
    heroLayout?: 'minimal' | 'cinematic-bg' | 'split';
  };
  gallery: {
    badge: string;
    title: string;
    subtitle: string;
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
    directTitle?: string;
    socialLinks: SocialLink[];
  };
  layout: {
    galleryDefaultView: 'grid3' | 'grid2' | 'feed';
    showServices: boolean;
    showAbout: boolean;
  };
}
