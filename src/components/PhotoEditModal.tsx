import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import { X, Upload, Check, Trash2, Plus, Image as ImageIcon } from 'lucide-react';

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

export const PhotoEditModal = ({ photo, onClose, onSave }: PhotoEditModalProps) => {
  if (!photo) return null;

  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState<CategoryType>(photo.category);
  const [year, setYear] = useState(photo.year);
  const [description, setDescription] = useState(photo.description || '');

  // 5-Photo Showcase Array: Slot 0 to 4
  const [photoSlots, setPhotoSlots] = useState<string[]>(() => {
    const existing = photo.images && photo.images.length > 0
      ? [...photo.images]
      : [photo.imageUrl];
    // Pad to 5 slots
    while (existing.length < 5) {
      existing.push('');
    }
    return existing.slice(0, 5);
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
      while (existing.length < 5) {
        existing.push('');
      }
      setPhotoSlots(existing.slice(0, 5));
    }
  }, [photo]);

  // Single Slot File Upload
  const handleSlotFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setPhotoSlots((prev) => {
          const updated = [...prev];
          updated[index] = result;
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Batch Multi-File Upload (Up to 5 files at once)
  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 5);
    fileList.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setPhotoSlots((prev) => {
            const updated = [...prev];
            updated[idx] = result;
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
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
    // Filter out empty slots
    const validImages = photoSlots.filter((url) => url.trim().length > 0);
    const coverImage = validImages[0] || photo.imageUrl;

    onSave(photo.id, {
      title: title.trim(),
      category,
      imageUrl: coverImage,
      images: validImages.length > 0 ? validImages : [coverImage],
      year: year.trim(),
      description: description.trim()
    });
    onClose();
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
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7 text-zinc-100 my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Edit Project Details & 5 Showcase Photos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* 5-Photo Showcase Uploader */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase text-white font-semibold block">
                  Project Photos ({uploadedCount}/5 Uploaded)
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Slot 1 is the main cover. Visitors can flip through all 5 photos in the project gallery.
                </span>
              </div>

              {/* Batch Upload Button */}
              <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white rounded cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Up to 5 Files</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBatchFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 5 Slots Grid */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              {photoSlots.map((slotUrl, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-3"
                >
                  {/* Thumbnail / Placeholder */}
                  <div className="w-14 h-14 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative group">
                    {slotUrl ? (
                      <img
                        src={slotUrl}
                        alt={`Slot ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">
                        Empty
                      </span>
                    )}
                  </div>

                  {/* Slot Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
                        Photo {idx + 1} {idx === 0 && '(Main Cover)'}
                      </span>
                      {slotUrl && (
                        <button
                          type="button"
                          onClick={() => handleClearSlot(idx)}
                          className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
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
                        placeholder={idx === 0 ? "Paste Cover Image URL or upload file" : `Paste Photo ${idx + 1} URL or upload file`}
                        className="flex-1 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                      />

                      <label className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] font-mono text-zinc-200 cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>Browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSlotFileUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
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
              placeholder="e.g. Ritual Arts"
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
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
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
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
