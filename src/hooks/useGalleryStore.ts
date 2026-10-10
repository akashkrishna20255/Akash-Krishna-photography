import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import { DEFAULT_PHOTOS } from '../data/defaultGallery';

const STORAGE_KEY_PHOTOS = 'akash_portfolio_photos_v1';
const STORAGE_KEY_ADMIN_KEY = 'akash_portfolio_admin_key_v1';
const STORAGE_KEY_ADMIN_EMAIL = 'akash_portfolio_admin_email_v1';
const STORAGE_KEY_IS_LOGGED_IN = 'akash_portfolio_admin_logged_in_v1';

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

  // Admin Key state (default 'akash2026')
  const [adminKey, setAdminKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_KEY) || 'akash2026';
  });

  // Admin Email (default user's email: 'akashkrishna67@gmail.com')
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_EMAIL) || 'akashkrishna67@gmail.com';
  });

  // Admin Logged in state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_IS_LOGGED_IN) === 'true';
  });

  // Temporary reset code state for email key reset flow
  const [pendingResetCode, setPendingResetCode] = useState<string | null>(null);

  // Sync photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.error('Failed to save photos to localStorage', e);
    }
  }, [photos]);

  // Sync admin key
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMIN_KEY, adminKey);
  }, [adminKey]);

  // Sync admin email
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMIN_EMAIL, adminEmail);
  }, [adminEmail]);

  // Sync logged in status
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_IS_LOGGED_IN, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // CRUD Operations
  const addPhoto = (photo: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: `photo-${Date.now()}`
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    return newPhoto;
  };

  const updatePhoto = (id: string, updatedFields: Partial<GalleryPhoto>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefaultPhotos = () => {
    setPhotos(DEFAULT_PHOTOS);
  };

  // Auth Operations
  const login = (key: string): boolean => {
    if (key.trim() === adminKey.trim()) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  // Initiate reset via email
  const sendEmailResetCode = (inputEmail: string): { success: boolean; code?: string; message: string } => {
    const normalizedInput = inputEmail.trim().toLowerCase();
    const normalizedStored = adminEmail.trim().toLowerCase();

    // Verify email matches
    if (normalizedInput !== normalizedStored) {
      return {
        success: false,
        message: `Email does not match registered admin email (${adminEmail})`
      };
    }

    // Generate random 4-digit verification code
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setPendingResetCode(generatedCode);

    return {
      success: true,
      code: generatedCode,
      message: `A security reset code has been sent to ${adminEmail}`
    };
  };

  // Complete reset with code
  const verifyAndResetKey = (
    code: string,
    newKey: string
  ): { success: boolean; message: string } => {
    if (!pendingResetCode) {
      return { success: false, message: 'No reset session active. Please request a new code.' };
    }

    if (code.trim() !== pendingResetCode.trim()) {
      return { success: false, message: 'Invalid verification code. Please check and try again.' };
    }

    if (!newKey || newKey.trim().length < 4) {
      return { success: false, message: 'New admin key must be at least 4 characters long.' };
    }

    setAdminKey(newKey.trim());
    setPendingResetCode(null);
    setIsAdmin(true); // Automatically log in on reset
    return { success: true, message: 'Admin key successfully updated! You are now logged in.' };
  };

  return {
    photos,
    adminKey,
    adminEmail,
    isAdmin,
    addPhoto,
    updatePhoto,
    deletePhoto,
    resetToDefaultPhotos,
    login,
    logout,
    sendEmailResetCode,
    verifyAndResetKey,
    pendingResetCode,
    setAdminEmail
  };
};
