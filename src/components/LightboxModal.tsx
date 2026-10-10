import { useState, useEffect } from 'react';
import { GalleryPhoto } from '../types/gallery';
import { X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface LightboxModalProps {
  photo: GalleryPhoto | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LightboxModal = ({
  photo,
  currentIndex,
  totalCount,
  onClose,
  onNext,
  onPrev
}: LightboxModalProps) => {
  // Active photo index within the current project's 5-photo showcase
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Reset active photo to 0 when project changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [photo?.id]);

  // Project showcase images list (up to 5 photos)
  const showcaseImages: string[] = photo
    ? photo.images && photo.images.length > 0
      ? photo.images
      : [photo.imageUrl]
    : [];

  const totalShowcasePhotos = showcaseImages.length;
  const currentImageUrl = showcaseImages[activePhotoIndex] || photo?.imageUrl || '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (activePhotoIndex < totalShowcasePhotos - 1) {
          setActivePhotoIndex((prev) => prev + 1);
        } else {
          onNext();
        }
      }
      if (e.key === 'ArrowLeft') {
        if (activePhotoIndex > 0) {
          setActivePhotoIndex((prev) => prev - 1);
        } else {
          onPrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, activePhotoIndex, totalShowcasePhotos]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/90 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="text-white font-semibold">{photo.category}</span>
          <span className="text-zinc-600">/</span>
          <span>{photo.year}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 tabular-nums">
            Project {currentIndex + 1} of {totalCount}
          </span>
          {totalShowcasePhotos > 1 && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>Photo {activePhotoIndex + 1} of {totalShowcasePhotos}</span>
              </span>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative max-w-6xl max-h-[85vh] w-full px-4 sm:px-16 flex flex-col items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Image Display with Key for Transition */}
        <div className="relative flex items-center justify-center max-h-[64vh]">
          <img
            key={`${photo.id}-${activePhotoIndex}`}
            src={currentImageUrl}
            alt={`${photo.title} - Photo ${activePhotoIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-zinc-900 animate-in fade-in duration-200"
          />

          {/* Previous / Next inside the 5-photo project */}
          {totalShowcasePhotos > 1 && (
            <>
              {activePhotoIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => prev - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs border border-zinc-700 cursor-pointer shadow-lg"
                  title="Previous Photo in Project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {activePhotoIndex < totalShowcasePhotos - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => prev + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs border border-zinc-700 cursor-pointer shadow-lg"
                  title="Next Photo in Project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* 5-Photo Showcase Thumbnail Selector Strip */}
        {totalShowcasePhotos > 1 && (
          <div className="mt-3 flex items-center gap-2 p-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 max-w-full overflow-x-auto">
            {showcaseImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative shrink-0 ${
                  activePhotoIndex === idx
                    ? 'border-amber-400 scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-zinc-600'
                }`}
                title={`Showcase Photo ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] font-mono px-1 rounded-tl text-zinc-300">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Project Title & Caption */}
        <div className="mt-3 text-center max-w-xl">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {photo.title}
          </h3>
          {photo.description && (
            <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed line-clamp-2">
              {photo.description}
            </p>
          )}
        </div>
      </div>

      {/* Outer Project Navigation Arrows (Flip between projects) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800 z-30"
        aria-label="Previous Project"
        title="Previous Project (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800 z-30"
        aria-label="Next Project"
        title="Next Project (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
