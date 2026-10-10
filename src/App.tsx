import { useState } from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';
import { Navbar } from './components/Navbar';
import { HeroSimple } from './components/HeroSimple';
import { GalleryGrid } from './components/GalleryGrid';
import { ServicesSection } from './components/ServicesSection';
import { AboutSimple } from './components/AboutSimple';
import { ContactSimple } from './components/ContactSimple';
import { FooterSimple } from './components/FooterSimple';
import { LightboxModal } from './components/LightboxModal';
import { AdminModal } from './components/AdminModal';
import { PhotoEditModal } from './components/PhotoEditModal';
import { GalleryPhoto } from './types/gallery';

export default function App() {
  const {
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
    setAdminEmail
  } = useGalleryStore();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Selected photo for lightbox
  const currentLightboxPhoto =
    lightboxIndex !== null && photos[lightboxIndex] ? photos[lightboxIndex] : null;

  const handleNextPhoto = () => {
    if (lightboxIndex !== null && photos.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (lightboxIndex !== null && photos.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Top Bar Navigation */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <main>
        {/* Hostinger-Style Portfolio Hero Section */}
        <HeroSimple
          isAdmin={isAdmin}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          photoCount={photos.length}
        />

        {/* Minimal Black Photo Gallery Grid with Layout Switcher */}
        <GalleryGrid
          photos={photos}
          isAdmin={isAdmin}
          onSelectPhoto={(photo, index) => setLightboxIndex(index)}
          onEditPhoto={(photo) => setEditingPhoto(photo)}
          onDeletePhoto={(id) => deletePhoto(id)}
          onOpenAddModal={() => setIsAdminModalOpen(true)}
        />

        {/* Areas of Expertise / Services Strip */}
        <ServicesSection />

        {/* About Section with Studio Portrait */}
        <AboutSimple />

        {/* Contact Section */}
        <ContactSimple />
      </main>

      {/* Footer */}
      <FooterSimple />

      {/* Fullscreen Lightbox Modal */}
      {currentLightboxPhoto && lightboxIndex !== null && (
        <LightboxModal
          photo={currentLightboxPhoto}
          currentIndex={lightboxIndex}
          totalCount={photos.length}
          onClose={() => setLightboxIndex(null)}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
        />
      )}

      {/* Admin Panel Modal (Login, Email Key Reset, Upload New Photos, Settings) */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        adminKey={adminKey}
        photos={photos}
        onLogin={login}
        onLogout={logout}
        onSendResetCode={sendEmailResetCode}
        onVerifyAndReset={verifyAndResetKey}
        onAddPhoto={addPhoto}
        onDeletePhoto={deletePhoto}
        onEditPhoto={(photo) => {
          setIsAdminModalOpen(false);
          setEditingPhoto(photo);
        }}
        onResetToDefault={resetToDefaultPhotos}
        onUpdateEmail={setAdminEmail}
      />

      {/* Direct Photo Edit Modal */}
      <PhotoEditModal
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={(id, updated) => updatePhoto(id, updated)}
      />
    </div>
  );
}
