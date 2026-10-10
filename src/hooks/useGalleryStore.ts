import { useState, useEffect } from 'react';
import { GalleryPhoto, SiteContent } from '../types/gallery';
import { DEFAULT_PHOTOS } from '../data/defaultGallery';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY_PHOTOS = 'akash_portfolio_photos_v2';
const STORAGE_KEY_SITE_CONTENT = 'akash_portfolio_site_content_v2';

export const useGalleryStore = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch photos from Firestore
      try {
        const photosSnapshot = await getDocs(collection(db, 'photos'));
        const photosData = photosSnapshot.docs.map(doc => doc.data() as GalleryPhoto);
        if (photosData.length > 0) {
            setPhotos(photosData);
        }
      } catch (e) {
        console.error('Error fetching photos from Firestore', e);
      }

      // Fetch site content from Firestore
      try {
        const contentSnapshot = await getDocs(collection(db, 'siteContent'));
        const contentData = contentSnapshot.docs.find(doc => doc.id === 'main')?.data() as SiteContent;
        if (contentData) {
            setSiteContent(contentData);
        }
      } catch (e) {
        console.error('Error fetching site content from Firestore', e);
      }
    };
    fetchData();
  }, []);

  const addPhoto = async (photo: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = { ...photo, id: `photo-${Date.now()}` };
    const nextPhotos = [newPhoto, ...photos];
    setPhotos(nextPhotos);
    await setDoc(doc(db, 'photos', newPhoto.id), newPhoto);
    return newPhoto;
  };

  const updatePhoto = async (id: string, updatedFields: Partial<GalleryPhoto>): Promise<boolean> => {
    const nextPhotos = photos.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setPhotos(nextPhotos);
    await updateDoc(doc(db, 'photos', id), updatedFields);
    return true;
  };

  const deletePhoto = async (id: string) => {
    const nextPhotos = photos.filter((p) => p.id !== id);
    setPhotos(nextPhotos);
    await deleteDoc(doc(db, 'photos', id));
  };

  const updateSiteContent = async (newContent: Partial<SiteContent>) => {
    const updated = { ...siteContent, ...newContent };
    setSiteContent(updated);
    await setDoc(doc(db, 'siteContent', 'main'), updated, { merge: true });
  };

  return {
    photos,
    siteContent,
    addPhoto,
    updatePhoto,
    deletePhoto,
    updateSiteContent,
    isAdmin
  };
};
