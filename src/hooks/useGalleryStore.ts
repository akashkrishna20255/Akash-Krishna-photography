import { useState, useEffect } from 'react';
import { GalleryPhoto, SiteContent, ServiceItem } from '../types/gallery';
import { DEFAULT_PHOTOS } from '../data/defaultGallery';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import {
  hashAdminKey,
  verifyAdminKey,
  generateSecureToken,
  generateSecureOTP,
  SECURITY_CONFIG
} from '../utils/security';

const STORAGE_KEY_PHOTOS = 'akash_portfolio_photos_v2';
const STORAGE_KEY_SITE_CONTENT = 'akash_portfolio_site_content_v2';
const STORAGE_KEY_KEY_HASH = 'akash_portfolio_key_hash_v2';
const STORAGE_KEY_SESSION_TOKEN = 'akash_portfolio_session_token_v2';
const STORAGE_KEY_SESSION_EXPIRY = 'akash_portfolio_session_expiry_v2';
const STORAGE_KEY_FAILED_ATTEMPTS = 'akash_portfolio_failed_attempts_v2';
const STORAGE_KEY_LOCKOUT_UNTIL = 'akash_portfolio_lockout_until_v2';

export const useGalleryStore = () => {
  // Photos state
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
            hero: { ...DEFAULT_SITE_CONTENT.hero, ...parsed.hero },
            about: { ...DEFAULT_SITE_CONTENT.about, ...parsed.about },
            contact: { ...DEFAULT_SITE_CONTENT.contact, ...parsed.contact },
            layout: { ...DEFAULT_SITE_CONTENT.layout, ...parsed.layout }
          };
        }
      }
    } catch (e) {
      console.error('Error loading site content', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

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

  // Sync photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.error('Failed to save photos to localStorage', e);
    }
  }, [photos]);

  // Sync site content to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SITE_CONTENT, JSON.stringify(siteContent));
    } catch (e) {
      console.error('Failed to save site content to localStorage', e);
    }
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
    setSiteContent((prev) => ({
      ...prev,
      ...newContent
    }));
  };

  // Update specific sections
  const updateHeroContent = (newHero: Partial<SiteContent['hero']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...newHero }
    }));
  };

  const updateAboutContent = (newAbout: Partial<SiteContent['about']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      about: { ...prev.about, ...newAbout }
    }));
  };

  const updateContactContent = (newContact: Partial<SiteContent['contact']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...newContact }
    }));
  };

  const updateLayoutContent = (newLayout: Partial<SiteContent['layout']>) => {
    if (!isAdmin) return;
    setSiteContent((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...newLayout }
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

  // Photo CRUD Operations
  const addPhoto = (photo: Omit<GalleryPhoto, 'id'>) => {
    if (!isAdmin) return null;
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: `photo-${Date.now()}`
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    return newPhoto;
  };

  const updatePhoto = (id: string, updatedFields: Partial<GalleryPhoto>) => {
    if (!isAdmin) return;
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deletePhoto = (id: string) => {
    if (!isAdmin) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefaultPhotos = () => {
    if (!isAdmin) return;
    setPhotos(DEFAULT_PHOTOS);
  };

  const resetSiteContentToDefaults = () => {
    if (!isAdmin) return;
    setSiteContent(DEFAULT_SITE_CONTENT);
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
    isAdmin,
    adminEmail: SECURITY_CONFIG.REGISTERED_EMAIL,
    failedAttempts,
    lockoutUntil,
    addPhoto,
    updatePhoto,
    deletePhoto,
    resetToDefaultPhotos,
    updateSiteContent,
    updateHeroContent,
    updateAboutContent,
    updateContactContent,
    updateLayoutContent,
    addService,
    updateService,
    deleteService,
    resetSiteContentToDefaults,
    login,
    logout,
    sendEmailResetCode,
    verifyAndResetKey
  };
};
