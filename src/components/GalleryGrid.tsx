import { useState } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import { Plus, Edit2, Trash2, Maximize2, LayoutGrid, Columns, Rows, Layers } from 'lucide-react';

interface GalleryGridProps {
  photos: GalleryPhoto[];
  isAdmin: boolean;
  galleryContent?: {
    badge: string;
    title: string;
    subtitle: string;
  };
  onSelectPhoto: (photo: GalleryPhoto, index: number) => void;
  onEditPhoto: (photo: GalleryPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenAdminText?: () => void;
}

const CATEGORIES: CategoryType[] = [
  'All',
  'Visual Design',
  'Film & Motion',
  'Photography',
  'Editorial'
];

type ViewLayout = 'grid3' | 'grid2' | 'feed';

export const GalleryGrid = ({
  photos,
  isAdmin,
  galleryContent,
  onSelectPhoto,
  onEditPhoto,
  onDeletePhoto,
  onOpenAddModal,
  onOpenAdminText
}: GalleryGridProps) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [layout, setLayout] = useState<ViewLayout>('grid3');

  const filteredPhotos = photos.filter((photo) => {
    if (activeCategory === 'All') return true;
    return photo.category === activeCategory;
  });

  const displayBadge = galleryContent?.badge || 'PORTFOLIO GALLERY';
  const displayTitle = galleryContent?.title || 'Work Showcase';
  const displaySubtitle = galleryContent?.subtitle || `Showing ${filteredPhotos.length} of ${photos.length} projects. Click any project to view all 5 showcase photographs and case details.`;

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Gallery Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                {displayBadge}
              </span>
              {isAdmin && onOpenAdminText && (
                <button
                  onClick={onOpenAdminText}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  title="Edit Gallery Title & Description"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Gallery Text</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans uppercase">
              {displayTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-xl">
              {displaySubtitle}
            </p>
          </div>

          {/* Filters & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Switcher (Hostinger style layout toggle) */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
              <button
                onClick={() => setLayout('grid3')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  layout === 'grid3' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="3 Columns Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('grid2')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  layout === 'grid2' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="2 Columns Large"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('feed')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  layout === 'feed' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Editorial Feed View"
              >
                <Rows className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid Container */}
        <div
          className={`grid gap-6 sm:gap-8 transition-all ${
            layout === 'grid3'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : layout === 'grid2'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}
        >
          {/* Admin "Add Photo" Card */}
          {isAdmin && (
            <div
              onClick={onOpenAddModal}
              className={`group rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400 bg-zinc-950/70 hover:bg-zinc-900/60 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
                layout === 'feed' ? 'aspect-[21/9]' : 'aspect-[4/3]'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-zinc-900 group-hover:bg-amber-400 text-zinc-400 group-hover:text-black flex items-center justify-center mb-3 transition-colors shadow-lg">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-base font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider font-mono">
                + Add Project (Up to 10 Photos)
              </span>
              <p className="text-xs text-zinc-500 font-mono mt-1 max-w-xs">
                Upload up to 10 showcase photos to present the full project
              </p>
            </div>
          )}

          {/* Photo Cards */}
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 shadow-xl"
            >
              {/* Image Frame */}
              <div
                onClick={() => onSelectPhoto(photo, index)}
                className={`relative w-full overflow-hidden bg-zinc-900 cursor-pointer ${
                  layout === 'feed'
                    ? 'aspect-[16/9]'
                    : layout === 'grid2'
                    ? 'aspect-[16/10]'
                    : 'aspect-[4/3]'
                }`}
              >
                <img
                  key={`${photo.id}-${photo.imageUrl}`}
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                  }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.4';
                  }}
                />

                {/* Subtle vignette on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Project</span>
                  </span>
                </div>

                {/* Tag pill in top left */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-mono text-zinc-300 border border-zinc-800">
                  {photo.category}
                </div>

                {/* Showcase count badge in top right if multiple photos */}
                {photo.images && photo.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-amber-400 border border-zinc-800 flex items-center gap-1 shadow-md">
                    <span>{photo.images.length} Photos</span>
                  </div>
                )}
              </div>

              {/* Text & Meta Information */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                    <span>{photo.category}</span>
                    <span>{photo.year}</span>
                  </div>

                  <h3
                    onClick={() => onSelectPhoto(photo, index)}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-zinc-300 transition-colors cursor-pointer line-clamp-1"
                  >
                    {photo.title}
                  </h3>

                  {photo.description && (
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 line-clamp-2 font-light leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>

                {/* Admin Quick Action Controls */}
                {isAdmin && (
                  <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">
                      ADMIN CONTROLS
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPhoto(photo);
                        }}
                        className="px-2.5 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit photo details"
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${photo.title}" from gallery?`)) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-mono bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 rounded border border-zinc-800 hover:border-red-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950">
            <p className="text-zinc-400 text-sm">No projects currently found in "{activeCategory}".</p>
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="mt-4 px-5 py-2.5 bg-amber-400 text-black text-xs font-bold uppercase rounded-lg hover:bg-amber-300 cursor-pointer"
              >
                + Add Photo to this Category
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
