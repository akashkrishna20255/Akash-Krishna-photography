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
    siteContent,
    addPhoto,
    updatePhoto,
    deletePhoto,
    updateSiteContent,
    isAdmin,
    verifyAdminKey,
    logout
  } = useGalleryStore();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminModalInitialTab, setAdminModalInitialTab] = useState<'add' | 'manage' | 'content' | 'layout' | 'settings'>('content');
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleOpenAdminWithTab = (tab: 'add' | 'manage' | 'content' | 'layout' | 'settings' = 'content') => {
    setAdminModalInitialTab(tab);
    setIsAdminModalOpen(true);
  };

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
        onOpenAdmin={() => handleOpenAdminWithTab('add')}
      />

      <main>
        {/* Hostinger-Style Portfolio Hero Section (with optional full-screen background) */}
        <HeroSimple
          heroContent={siteContent.hero}
          isAdmin={isAdmin}
          onOpenAdmin={(tab) => handleOpenAdminWithTab(tab || 'content')}
        />

        {/* Minimal Black Photo Gallery Grid */}
        <GalleryGrid
          photos={photos}
          isAdmin={isAdmin}
          categories={['Visual Design', 'Film & Motion', 'Photography', 'Editorial']}
          allCategoryLabel="All"
          onUpdateCategories={() => {}}
          galleryContent={siteContent.gallery}
          onSelectPhoto={(photo, index) => setLightboxIndex(index)}
          onEditPhoto={(photo) => setEditingPhoto(photo)}
          onDeletePhoto={(id) => deletePhoto(id)}
          onOpenAddModal={() => handleOpenAdminWithTab('add')}
          onOpenAdminText={() => handleOpenAdminWithTab('content')}
        />

        {/* Areas of Expertise / Services Strip (Configurable via Admin) */}
        {siteContent.layout.showServices && (
          <ServicesSection
            services={siteContent.services}
            isAdmin={isAdmin}
            onOpenAdmin={() => handleOpenAdminWithTab('content')}
          />
        )}

        {/* About Section with Studio Portrait & Biography (Configurable via Admin) */}
        {siteContent.layout.showAbout && (
          <AboutSimple
            aboutContent={siteContent.about}
            isAdmin={isAdmin}
            onOpenAdmin={() => handleOpenAdminWithTab('content')}
          />
        )}

        {/* Contact Section with Editable Availability & Direct Social Links */}
        <ContactSimple
          contactContent={siteContent.contact}
          isAdmin={isAdmin}
          onOpenAdmin={() => handleOpenAdminWithTab('content')}
        />
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

      {/* Complete Admin Panel Suite */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminEmail="akashkrishna67@gmail.com"
        photos={photos}
        siteContent={siteContent}
        categories={['Visual Design', 'Film & Motion', 'Photography', 'Editorial']}
        allCategoryLabel="All"
        failedAttempts={0}
        lockoutUntil={0}
        onLogin={async (key) => await verifyAdminKey(key)}
        onLogout={logout}
        onSendResetCode={(email) => ({ success: true, message: 'Code sent' })}
        onVerifyAndReset={async (code, newKey) => ({ success: true, message: 'Reset successful' })}
        onAddPhoto={addPhoto}
        onDeletePhoto={deletePhoto}
        onEditPhoto={() => {}}
        onResetToDefault={() => {}}
        onUpdateHero={() => {}}
        onUpdateAbout={() => {}}
        onUpdateContact={() => {}}
        onUpdateLayout={() => {}}
        onAddService={() => {}}
        onUpdateService={() => {}}
        onDeleteService={() => {}}
        onAddSocialLink={() => {}}
        onUpdateSocialLink={() => {}}
        onDeleteSocialLink={() => {}}
        onResetSiteContent={() => {}}
      />

      {/* Direct Photo Edit Modal */}
      <PhotoEditModal
        photo={editingPhoto}
        categories={['Visual Design', 'Film & Motion', 'Photography', 'Editorial']}
        onClose={() => setEditingPhoto(null)}
        onSave={(id, updated) => updatePhoto(id, updated)}
      />
    </div>
  );
}
