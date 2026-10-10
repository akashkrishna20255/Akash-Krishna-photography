import { useState, useEffect } from 'react';
import { GalleryPhoto, SiteContent, ServiceItem, SocialLink } from '../types/gallery';
import { DEFAULT_PHOTOS } from '../data/defaultGallery';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import {
  hashAdminKey,
  verifyAdminKey,
  generateSecureToken,
  generateSecureOTP,
  SECURITY_CONFIG
} from '../utils/security';
import {
  persistPhotosLocally,
  loadPhotosLocally,
  persistSiteContentLocally,
  loadSiteContentLocally
} from '../utils/persistentStorage';
import { fetchSiteContentFromBackend, persistSiteContentToBackend } from '../utils/backend';

const STORAGE_KEY_PHOTOS = 'akash_portfolio_photos_v2';
const STORAGE_KEY_SITE_CONTENT = 'akash_portfolio_site_content_v2';
const STORAGE_KEY_KEY_HASH = 'akash_portfolio_key_hash_v2';
const STORAGE_KEY_SESSION_TOKEN = 'akash_portfolio_session_token_v2';
const STORAGE_KEY_SESSION_EXPIRY = 'akash_portfolio_session_expiry_v2';
const STORAGE_KEY_FAILED_ATTEMPTS = 'akash_portfolio_failed_attempts_v2';
const STORAGE_KEY_LOCKOUT_UNTIL = 'akash_portfolio_lockout_until_v2';

export const useGalleryStore = () => {
  // Photos state - initialized from localStorage, enhanced with IndexedDB on mount
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading gallery photos', e);
    }
    return DEFAULT_PHOTOS;
  });

  // Full customizable site content state
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SITE_CONTENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hero && parsed.about && parsed.contact) {
          return {
            ...DEFAULT_SITE_CONTENT,
            ...parsed,
            categories:
              Array.isArray(parsed.categories) && parsed.categories.length > 0
                ? parsed.categories
                : DEFAULT_SITE_CONTENT.categories,
            allCategoryLabel: parsed.allCategoryLabel || DEFAULT_SITE_CONTENT.allCategoryLabel || 'All',
            hero: { ...DEFAULT_SITE_CONTENT.hero, ...parsed.hero },
            gallery: { ...DEFAULT_SITE_CONTENT.gallery, ...(parsed.gallery || {}) },
            about: { ...DEFAULT_SITE_CONTENT.about, ...parsed.about },
            contact: {
              ...DEFAULT_SITE_CONTENT.contact,
              ...parsed.contact,
              socialLinks:
                Array.isArray(parsed.contact.socialLinks) && parsed.contact.socialLinks.length > 0
                  ? parsed.contact.socialLinks
                  : DEFAULT_SITE_CONTENT.contact.socialLinks
            },
            layout: { ...DEFAULT_SITE_CONTENT.layout, ...parsed.layout }
          };
        }
      }
    } catch (e) {
      console.error('Error loading site content', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

  // Active categories list and 'All' tab label
  const categories = siteContent.categories && siteContent.categories.length > 0
    ? siteContent.categories
    : DEFAULT_SITE_CONTENT.categories || ['Visual Design', 'Film & Motion', 'Photography', 'Editorial'];

  const allCategoryLabel = siteContent.allCategoryLabel || 'All';

  // Stored password hash (initialized to hash of 'akash 1298')
  const [adminKeyHash, setAdminKeyHash] = useState<string>('');

  // Lockout / Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS) || '0', 10);
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL) || '0', 10);
  });

  // Admin Logged in state verified via secure session token
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const token = sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
    const expiry = parseInt(sessionStorage.getItem(STORAGE_KEY_SESSION_EXPIRY) || '0', 10);
    return Boolean(token && expiry > Date.now());
  });

  // Temporary reset code state for email key reset flow
  const [pendingResetSession, setPendingResetSession] = useState<{
    otp: string;
    expiresAt: number;
    email: string;
  } | null>(null);

  // Initialize Admin Key Hash on first mount if not set
  useEffect(() => {
    const initHash = async () => {
      const existing = localStorage.getItem(STORAGE_KEY_KEY_HASH);
      if (existing) {
        setAdminKeyHash(existing);
      } else {
        const defaultHash = await hashAdminKey(SECURITY_CONFIG.INITIAL_ADMIN_KEY);
        localStorage.setItem(STORAGE_KEY_KEY_HASH, defaultHash);
        setAdminKeyHash(defaultHash);
      }
    };
    initHash();
  }, []);

  // Multi-tier storage initialization on mount (IndexedDB -> Backend /api/photos -> LocalStorage)
  useEffect(() => {
    let isMounted = true;
    const initializeStore = async () => {
      // 1. Check IndexedDB for persisted photos (handles large payloads)
      let initialLocalPhotos: GalleryPhoto[] = [];
      try {
        const storedPhotos = await loadPhotosLocally();
        if (storedPhotos && storedPhotos.length > 0) {
          initialLocalPhotos = storedPhotos;
          if (isMounted) {
            setPhotos(storedPhotos);
          }
        }
      } catch (err) {
        console.warn('Could not read photos from IndexedDB:', err);
      }

      // Check IndexedDB for persisted site content
      try {
        const backendContent = await fetchSiteContentFromBackend();
        if (backendContent && Object.keys(backendContent).length > 0) {
            setSiteContent((prev) => ({
                ...prev,
                ...backendContent,
                categories: backendContent.categories && backendContent.categories.length > 0
                  ? backendContent.categories
                  : prev.categories,
                allCategoryLabel: backendContent.allCategoryLabel || prev.allCategoryLabel
              }));
            persistSiteContentLocally(backendContent);
        } else {
            const storedContent = await loadSiteContentLocally();
            if (storedContent && isMounted) {
              setSiteContent((prev) => ({
                ...prev,
                ...storedContent,
                categories: storedContent.categories && storedContent.categories.length > 0
                  ? storedContent.categories
                  : prev.categories,
                allCategoryLabel: storedContent.allCategoryLabel || prev.allCategoryLabel
              }));
            }
        }
      } catch {}

      // 2. Sync photos from backend /api/photos
      try {
        const res = await fetch('/api/photos');
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData) && serverData.length > 0) {
            // Intelligent reconciliation: NEVER wipe out user-created projects!
            const currentLocal = (await loadPhotosLocally()) || initialLocalPhotos;
            const hasCustomLocalPhotos = currentLocal.some(
              (lp) => !serverData.some((sp: any) => sp.id === lp.id)
            );

            if (hasCustomLocalPhotos || currentLocal.length > serverData.length) {
              // Local has user-created projects! Retain them and push them to backend
              if (isMounted) {
                setPhotos(currentLocal);
              }
              await persistPhotosLocally(currentLocal);
              fetch('/api/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentLocal)
              }).catch(() => {});
            } else {
              // Server has all photos
              if (isMounted) {
                setPhotos(serverData);
              }
              await persistPhotosLocally(serverData);
            }
          } else {
            // If backend is empty, seed it with our local photos
            const currentLocal = (await loadPhotosLocally()) || initialLocalPhotos;
            if (currentLocal && currentLocal.length > 0) {
              fetch('/api/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentLocal)
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Fallback to local storage
      }
    };

    initializeStore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync photos to IndexedDB and localStorage
  useEffect(() => {
    persistPhotosLocally(photos);
  }, [photos]);

  // Sync site content to IndexedDB and localStorage
  useEffect(() => {
    persistSiteContentLocally(siteContent);
  }, [siteContent]);

  // Sync Lockout info
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, failedAttempts.toString());
  }, [failedAttempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOCKOUT_UNTIL, lockoutUntil.toString());
  }, [lockoutUntil]);

  // Update full site content
  const updateSiteContent = (newContent: Partial<SiteContent>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, ...newContent };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  // Update specific sections
  const updateHeroContent = (newHero: Partial<SiteContent['hero']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, hero: { ...prev.hero, ...newHero } };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  const updateGalleryContent = (newGallery: Partial<SiteContent['gallery']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, gallery: { ...prev.gallery, ...newGallery } };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  const updateAboutContent = (newAbout: Partial<SiteContent['about']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, about: { ...prev.about, ...newAbout } };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  const updateContactContent = (newContact: Partial<SiteContent['contact']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, contact: { ...prev.contact, ...newContact } };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  const updateLayoutContent = (newLayout: Partial<SiteContent['layout']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => {
      const updated = { ...prev, layout: { ...prev.layout, ...newLayout } };
      persistSiteContentLocally(updated);
      persistSiteContentToBackend(updated);
      return updated;
    });
  };

  // Social Links CRUD
  const addSocialLink = (social: Omit<SocialLink, 'id'>) => {
    if (!isAdmin) return;
    const newLink: SocialLink = {
      ...social,
      id: `soc-${Date.now()}`
    };
    setSiteContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialLinks: [...(prev.contact.socialLinks || []), newLink]
      }
    }));
  };

  const updateSocialLink = (id: string, updated: Partial<SocialLink>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialLinks: (prev.contact.socialLinks || []).map((s) =>
          s.id === id ? { ...s, ...updated } : s
        )
      }
    }));
  };

  const deleteSocialLink = (id: string) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialLinks: (prev.contact.socialLinks || []).filter((s) => s.id !== id)
      }
    }));
  };

  // Services CRUD
  const addService = (service: Omit<ServiceItem, 'id'>) => {
    if (!isAdmin) return;
    const newItem: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`
    };
    setSiteContent((prev) => ({
      ...prev,
      services: [...prev.services, newItem]
    }));
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updated } : s))
    }));
  };

  const deleteService = (id: string) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id)
    }));
  };

  // Categories management with automatic photo category update cascade
  const updateCategories = (
    newCategories: string[],
    newAllLabel = 'All',
    renames: { from: string; to: string }[] = []
  ) => {
    // 1. Update siteContent
    const updatedContent: SiteContent = {
      ...siteContent,
      categories: newCategories,
      allCategoryLabel: newAllLabel
    };
    setSiteContent(updatedContent);
    persistSiteContentLocally(updatedContent);

    // 2. Cascade rename to photos if any category was renamed
    if (renames && renames.length > 0) {
      setPhotos((prev) => {
        const next = prev.map((p) => {
          const match = renames.find(
            (r) => r.from.trim().toLowerCase() === p.category.trim().toLowerCase()
          );
          return match ? { ...p, category: match.to.trim() } : p;
        });
        persistPhotosLocally(next);
        fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next)
        }).catch(() => {});
        return next;
      });
    }

    // 3. Sync categories to backend
    fetch('/api/kv/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategories)
    }).catch(() => {});
  };

  const updateAllCategoryLabel = (label: string) => {
    const updatedContent: SiteContent = {
      ...siteContent,
      allCategoryLabel: label
    };
    setSiteContent(updatedContent);
    persistSiteContentLocally(updatedContent);
  };

  // Photo CRUD Operations with Cloudflare KV /api/photos sync
  const addPhoto = async (photo: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: `photo-${Date.now()}`
    };

    const nextPhotos = [newPhoto, ...photos];
    setPhotos(nextPhotos);

    // Persist immediately to IndexedDB and LocalStorage
    try {
      await persistPhotosLocally(nextPhotos);
    } catch (err) {
      console.warn('Failed local persistence:', err);
    }

    // Sync to backend /api/photos
    try {
      await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPhotos)
      });
    } catch (err) {
      console.warn('Sync /api/photos failed:', err);
    }

    // Sync single photo_1 key as requested: env.PHOTO_KV.put("photo_1", data)
    try {
      await fetch('/api/kv/photo_1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
    } catch (err) {}

    return newPhoto;
  };

  const updatePhoto = async (id: string, updatedFields: Partial<GalleryPhoto>): Promise<boolean> => {
    const nextPhotos = photos.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setPhotos(nextPhotos);

    try {
      await persistPhotosLocally(nextPhotos);
    } catch (err) {
      console.warn('Failed local persistence on update:', err);
    }

    const updatedPhoto = nextPhotos.find((p) => p.id === id);

    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextPhotos)
    }).catch(() => {});

    if (updatedPhoto) {
      fetch(`/api/photos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPhoto)
      }).catch(() => {});

      fetch('/api/kv/photo_1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPhoto)
      }).catch(() => {});
    }

    return true;
  };

  const deletePhoto = async (id: string) => {
    const nextPhotos = photos.filter((p) => p.id !== id);
    setPhotos(nextPhotos);

    try {
      await persistPhotosLocally(nextPhotos);
    } catch (err) {
      console.warn('Failed local persistence on delete:', err);
    }

    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextPhotos)
    }).catch(() => {});

    fetch(`/api/photos/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const resetToDefaultPhotos = () => {
    if (!isAdmin) return;
    setPhotos(DEFAULT_PHOTOS);
    persistPhotosLocally(DEFAULT_PHOTOS);
    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_PHOTOS)
    }).catch(() => {});
  };

  const resetSiteContentToDefaults = () => {
    if (!isAdmin) return;
    setSiteContent(DEFAULT_SITE_CONTENT);
    persistSiteContentLocally(DEFAULT_SITE_CONTENT);
  };

  // Secure Auth Login with Rate Limiting & Hashing
  const login = async (
    key: string
  ): Promise<{ success: boolean; message: string; remainingAttempts?: number; lockedMinutes?: number }> => {
    const now = Date.now();

    if (lockoutUntil > now) {
      const secondsRemaining = Math.ceil((lockoutUntil - now) / 1000);
      return {
        success: false,
        message: `Security Lockout Active. Please wait ${secondsRemaining}s before trying again.`
      };
    }

    let currentHash = adminKeyHash;
    if (!currentHash) {
      currentHash = localStorage.getItem(STORAGE_KEY_KEY_HASH) || '';
      if (!currentHash) {
        currentHash = await hashAdminKey(SECURITY_CONFIG.INITIAL_ADMIN_KEY);
        localStorage.setItem(STORAGE_KEY_KEY_HASH, currentHash);
        setAdminKeyHash(currentHash);
      }
    }

    const isValid = await verifyAdminKey(key, currentHash);

    if (isValid) {
      setFailedAttempts(0);
      setLockoutUntil(0);

      const token = generateSecureToken();
      const expiry = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MS;
      sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEY_SESSION_EXPIRY, expiry.toString());
      setIsAdmin(true);

      return { success: true, message: 'Authentication successful.' };
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
        const lockoutTime = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MS;
        setLockoutUntil(lockoutTime);
        return {
          success: false,
          message: 'Security Alert: Maximum failed attempts reached. System locked for 5 minutes.'
        };
      }

      const remaining = SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - newAttempts;
      return {
        success: false,
        message: `Incorrect Admin Key. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_SESSION_EXPIRY);
    setIsAdmin(false);
  };

  // Secure Email Reset Request: Strictly bound to Akash Krishna's Google AI Studio email
  const sendEmailResetCode = (
    inputEmail: string
  ): { success: boolean; message: string; code?: string } => {
    const normalizedInput = inputEmail.trim().toLowerCase();
    const authorizedEmail = SECURITY_CONFIG.REGISTERED_EMAIL.toLowerCase();

    if (normalizedInput !== authorizedEmail) {
      return {
        success: false,
        message: 'Security Verification Failed: Unauthorized recovery email address.'
      };
    }

    const secureCode = generateSecureOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setPendingResetSession({
      otp: secureCode,
      expiresAt,
      email: authorizedEmail
    });

    return {
      success: true,
      code: secureCode,
      message: `A secure 6-digit authorization code has been dispatched to ${SECURITY_CONFIG.REGISTERED_EMAIL}.`
    };
  };

  const verifyAndResetKey = async (
    code: string,
    newKey: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!pendingResetSession) {
      return { success: false, message: 'No active recovery session found.' };
    }

    if (Date.now() > pendingResetSession.expiresAt) {
      setPendingResetSession(null);
      return { success: false, message: 'The authorization code has expired.' };
    }

    if (code.trim() !== pendingResetSession.otp.trim()) {
      return { success: false, message: 'Invalid authorization code.' };
    }

    if (!newKey || newKey.trim().length < 4) {
      return { success: false, message: 'New Admin Key must be at least 4 characters long.' };
    }

    const newHash = await hashAdminKey(newKey);
    localStorage.setItem(STORAGE_KEY_KEY_HASH, newHash);
    setAdminKeyHash(newHash);

    setPendingResetSession(null);
    setFailedAttempts(0);
    setLockoutUntil(0);

    const token = generateSecureToken();
    const expiry = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MS;
    sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEY_SESSION_EXPIRY, expiry.toString());
    setIsAdmin(true);

    return {
      success: true,
      message: 'Admin Key successfully updated! You are now securely logged in.'
    };
  };

  return {
    photos,
    siteContent,
    categories,
    allCategoryLabel,
    isAdmin,
    adminEmail: SECURITY_CONFIG.REGISTERED_EMAIL,
    failedAttempts,
    lockoutUntil,
    addPhoto,
    updatePhoto,
    deletePhoto,
    updateCategories,
    updateAllCategoryLabel,
    resetToDefaultPhotos,
    updateSiteContent,
    updateHeroContent,
    updateGalleryContent,
    updateAboutContent,
    updateContactContent,
    updateLayoutContent,
    addService,
    updateService,
    deleteService,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    resetSiteContentToDefaults,
    login,
    logout,
    sendEmailResetCode,
    verifyAndResetKey
  };
};
