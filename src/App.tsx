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
    adminEmail,
    isAdmin,
    failedAttempts,
    lockoutUntil,
    addPhoto,
    updatePhoto,
    deletePhoto,
    resetToDefaultPhotos,
    updateHeroContent,
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
          onSelectPhoto={(photo, index) => setLightboxIndex(index)}
          onEditPhoto={(photo) => setEditingPhoto(photo)}
          onDeletePhoto={(id) => deletePhoto(id)}
          onOpenAddModal={() => handleOpenAdminWithTab('add')}
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
        adminEmail={adminEmail}
        photos={photos}
        siteContent={siteContent}
        failedAttempts={failedAttempts}
        lockoutUntil={lockoutUntil}
        initialTab={adminModalInitialTab}
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
        onUpdateHero={updateHeroContent}
        onUpdateAbout={updateAboutContent}
        onUpdateContact={updateContactContent}
        onUpdateLayout={updateLayoutContent}
        onAddService={addService}
        onUpdateService={updateService}
        onDeleteService={deleteService}
        onAddSocialLink={addSocialLink}
        onUpdateSocialLink={updateSocialLink}
        onDeleteSocialLink={deleteSocialLink}
        onResetSiteContent={resetSiteContentToDefaults}
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
