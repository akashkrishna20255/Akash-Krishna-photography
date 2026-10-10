import { SiteContent } from '../types/gallery';

export const fetchSiteContentFromBackend = async (): Promise<SiteContent | null> => {
  try {
    const res = await fetch('/api/site-content');
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch site content from backend', error);
  }
  return null;
};

export const persistSiteContentToBackend = async (content: SiteContent) => {
  try {
    await fetch('/api/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
  } catch (error) {
    console.error('Failed to persist site content to backend', error);
  }
};
