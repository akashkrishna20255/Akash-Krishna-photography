import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import { X, Upload, Check, Trash2, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

interface PhotoEditModalProps {
  photo: GalleryPhoto | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<GalleryPhoto>) => void;
}

const CATEGORIES: CategoryType[] = [
  'Visual Design',
  'Film & Motion',
  'Photography',
  'Editorial'
];

const MAX_PROJECT_PHOTOS = 10;

export const PhotoEditModal = ({ photo, onClose, onSave }: PhotoEditModalProps) => {
  if (!photo) return null;

  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState<CategoryType>(photo.category);
  const [year, setYear] = useState(photo.year);
  const [description, setDescription] = useState(photo.description || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track processing state for background image compression
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSlotProcessing, setActiveSlotProcessing] = useState<number | null>(null);

  // Up to 10-Photo Showcase Array: Slots 0 to 9
  const [photoSlots, setPhotoSlots] = useState<string[]>(() => {
    const existing = photo.images && photo.images.length > 0
      ? [...photo.images]
      : [photo.imageUrl];
    while (existing.length < MAX_PROJECT_PHOTOS) {
      existing.push('');
    }
    return existing.slice(0, MAX_PROJECT_PHOTOS);
  });

  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setCategory(photo.category);
      setYear(photo.year);
      setDescription(photo.description || '');
      const existing = photo.images && photo.images.length > 0
        ? [...photo.images]
        : [photo.imageUrl];
      while (existing.length < MAX_PROJECT_PHOTOS) {
        existing.push('');
      }
      setPhotoSlots(existing.slice(0, MAX_PROJECT_PHOTOS));
      setSaveSuccess(false);
    }
  }, [photo]);

  // Single Slot File Upload with high-performance client compression
  const handleSlotFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSlotProcessing(index);
    try {
      const compressedDataUrl = await compressImageFile(file, 1600, 0.82);
      setPhotoSlots((prev) => {
        const updated = [...prev];
        updated[index] = compressedDataUrl;
        return updated;
      });
    } catch (err) {
      console.error('Failed to compress image file', err);
    } finally {
      setActiveSlotProcessing(null);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  // Batch Multi-File Upload (Up to 10 files at once)
  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const fileList = Array.from(files).slice(0, MAX_PROJECT_PHOTOS);
      
      // Determine starting index: fill empty slots first, or start at 0 if none
      const currentSlots = [...photoSlots];
      let targetIndex = 0;

      for (let i = 0; i < fileList.length && targetIndex < MAX_PROJECT_PHOTOS; i++) {
        // Find next available slot or overwrite from current targetIndex
        const compressed = await compressImageFile(fileList[i], 1600, 0.82);
        currentSlots[targetIndex] = compressed;
        targetIndex++;
      }

      setPhotoSlots(currentSlots);
    } catch (err) {
      console.error('Error during batch upload', err);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleSlotUrlChange = (index: number, url: string) => {
    setPhotoSlots((prev) => {
      const updated = [...prev];
      updated[index] = url;
      return updated;
    });
  };

  const handleClearSlot = (index: number) => {
    setPhotoSlots((prev) => {
      const updated = [...prev];
      updated[index] = '';
      return updated;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || activeSlotProcessing !== null) return;

    // Filter out empty slots
    const validImages = photoSlots.filter((url) => url.trim().length > 0);
    if (validImages.length === 0) {
      alert('Please provide at least 1 image for the project (Photo 1 - Main Cover).');
      return;
    }

    const coverImage = validImages[0];

    onSave(photo.id, {
      title: title.trim(),
      category,
      imageUrl: coverImage,
      images: validImages,
      year: year.trim() || '2026',
      description: description.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const uploadedCount = photoSlots.filter((u) => u.trim().length > 0).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7 text-zinc-100 my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Edit Project & Showcase Photos
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Upload up to 10 photos for this project. Photo 1 is the primary gallery cover.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Project photos and details saved successfully! Updating gallery showcase...</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* 10-Photo Showcase Uploader */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-white font-semibold block">
                    Showcase Photos ({uploadedCount}/10 Uploaded)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                    Max 10 Photos
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Slot 1 is the main cover. Visitors can flip through all photos in full-screen lightbox.
                </span>
              </div>

              {/* Batch Upload Button */}
              <label className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-md">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Up to 10 Photos</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isProcessing}
                  onChange={handleBatchFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 10 Slots List */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-800 max-h-[380px] overflow-y-auto pr-1">
              {photoSlots.map((slotUrl, idx) => {
                const isSlotLoading = activeSlotProcessing === idx;
                const isCover = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${
                      isCover
                        ? 'bg-zinc-950/90 border-amber-500/40'
                        : 'bg-zinc-950 border-zinc-800/90'
                    }`}
                  >
                    {/* Thumbnail / Placeholder */}
                    <div className="w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative group">
                      {isSlotLoading ? (
                        <div className="flex flex-col items-center justify-center text-amber-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-[8px] font-mono mt-0.5">Optimizing</span>
                        </div>
                      ) : slotUrl ? (
                        <>
                          <img
                            key={slotUrl.slice(0, 32)}
                            src={slotUrl}
                            alt={`Slot ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] font-mono px-1 rounded-tl text-amber-400">
                            #{idx + 1}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600">
                          Empty #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Slot Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
                            Photo {idx + 1}
                          </span>
                          {isCover && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-mono font-bold uppercase">
                              Primary Cover
                            </span>
                          )}
                        </div>

                        {slotUrl && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(idx)}
                            className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-0.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slotUrl}
                          onChange={(e) => handleSlotUrlChange(idx, e.target.value)}
                          placeholder={
                            isCover
                              ? 'Paste Cover Image URL or click Browse'
                              : `Paste Photo ${idx + 1} URL or click Browse`
                          }
                          className="flex-1 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                        />

                        <label className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] font-mono text-zinc-200 cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>Browse</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isSlotLoading}
                            onChange={(e) => handleSlotFileUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ritual Arts & Heritage"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-sans text-sm"
            />
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Description / Caption
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this project, client context, or visual art direction..."
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500">
              {uploadedCount} of 10 photos configured
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || activeSlotProcessing !== null}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Project & Photos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
