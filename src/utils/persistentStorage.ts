// Robust Client-Side Persistent Storage Engine for Akash Krishna Portfolio
// Uses IndexedDB for virtually unlimited storage (hundreds of MBs)
// with LocalStorage fallback and automatic error recovery.

import { GalleryPhoto, SiteContent } from '../types/gallery';
import { DEFAULT_PHOTOS } from '../data/defaultGallery';

const DB_NAME = 'akash_portfolio_db';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_kv';

const STORAGE_KEY_PHOTOS = 'akash_portfolio_photos_v2';
const STORAGE_KEY_SITE_CONTENT = 'akash_portfolio_site_content_v2';
const STORAGE_KEY_TIMESTAMP = 'akash_portfolio_last_saved_time';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ?? null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Save Photos to both IndexedDB and LocalStorage safely
export async function persistPhotosLocally(photos: GalleryPhoto[]): Promise<void> {
  const now = Date.now();
  // 1. IndexedDB (Primary, handles multi-megabyte payloads without quota errors)
  await idbSet('photos', photos);
  await idbSet('photos_updated_at', now);

  // 2. LocalStorage (Secondary, with try/catch to avoid unhandled QuotaExceededError)
  try {
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
  } catch (err) {
    // Quota exceeded in localStorage is fine since IndexedDB stores it safely!
    console.warn('LocalStorage quota limit reached, data safely retained in IndexedDB:', err);
  }
}

// Load Photos from local storage (IndexedDB first, then localStorage)
export async function loadPhotosLocally(): Promise<GalleryPhoto[] | null> {
  // 1. Try IndexedDB
  try {
    const fromIdb = await idbGet<GalleryPhoto[]>('photos');
    if (Array.isArray(fromIdb) && fromIdb.length > 0) {
      return fromIdb;
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB, trying localStorage:', err);
  }

  // 2. Try LocalStorage
  try {
    const fromLs = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (fromLs) {
      const parsed = JSON.parse(fromLs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from LocalStorage:', err);
  }

  return null;
}

// Save Site Content locally
export async function persistSiteContentLocally(content: SiteContent): Promise<void> {
  await idbSet('site_content', content);
  try {
    localStorage.setItem(STORAGE_KEY_SITE_CONTENT, JSON.stringify(content));
  } catch (err) {
    console.warn('LocalStorage save failed for site content:', err);
  }
}

// Load Site Content locally
export async function loadSiteContentLocally(): Promise<SiteContent | null> {
  try {
    const fromIdb = await idbGet<SiteContent>('site_content');
    if (fromIdb && fromIdb.hero && fromIdb.about) {
      return fromIdb;
    }
  } catch {}

  try {
    const fromLs = localStorage.getItem(STORAGE_KEY_SITE_CONTENT);
    if (fromLs) {
      const parsed = JSON.parse(fromLs);
      if (parsed && parsed.hero && parsed.about) {
        return parsed;
      }
    }
  } catch {}

  return null;
}
