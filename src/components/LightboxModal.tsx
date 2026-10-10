import { useEffect } from 'react';
import { GalleryPhoto } from '../types/gallery';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

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
        className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="text-white font-semibold">{photo.category}</span>
          <span className="text-zinc-600">/</span>
          <span>{photo.year}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 tabular-nums">
            {currentIndex + 1} of {totalCount}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Frame */}
      <div
        className="relative max-w-6xl max-h-[82vh] w-full px-4 sm:px-16 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.imageUrl}
          alt={photo.title}
          referrerPolicy="no-referrer"
          className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-zinc-900"
        />

        {/* Caption below image */}
        <div className="mt-4 text-center max-w-xl">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {photo.title}
          </h3>
          {photo.description && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light leading-relaxed">
              {photo.description}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
        aria-label="Previous Photo"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
        aria-label="Next Photo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
