import { ArrowDown, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { SiteContent } from '../types/gallery';

interface HeroSimpleProps {
  heroContent: SiteContent['hero'];
  isAdmin: boolean;
  onOpenAdmin: (initialTab?: 'add' | 'manage' | 'content' | 'settings') => void;
}

export const HeroSimple = ({ heroContent, isAdmin, onOpenAdmin }: HeroSimpleProps) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasBg = heroContent.showFullscreenBg && heroContent.fullscreenBgUrl;

  return (
    <section
      id="top"
      className={`relative text-white border-b border-zinc-900 transition-all duration-500 overflow-hidden ${
        hasBg
          ? 'min-h-[88vh] sm:min-h-screen flex items-center justify-center pt-28 pb-20'
          : 'pt-32 sm:pt-40 pb-20 bg-black'
      }`}
    >
      {/* Full-Screen Background Image Option */}
      {hasBg && (
        <div className="absolute inset-0 z-0">
          <img
            src={heroContent.fullscreenBgUrl}
            alt="Hero background"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          {/* Dynamic dark overlay */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: (heroContent.bgOverlayOpacity || 75) / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Big Editorial Headline */}
        <div className="max-w-5xl mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.04] uppercase">
            {heroContent.headline} <br />
            <span className={`text-zinc-400 font-normal ${heroContent.headlineAccentSize === 'small' ? 'text-2xl sm:text-3xl' : heroContent.headlineAccentSize === 'large' ? 'text-5xl sm:text-7xl' : 'text-3xl sm:text-5xl'}`}>
              {heroContent.headlineAccent}
            </span>
          </h1>
        </div>

        {/* Bio & Actions Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-6 border-t border-zinc-900/90">
          <div className="md:col-span-8">
            <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed max-w-2xl">
              {heroContent.bio}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center gap-3 md:justify-end">
            <button
              onClick={() => scrollTo('gallery')}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Explore Gallery</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('contact')}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              Contact Me
            </button>
          </div>
        </div>

        {/* Admin Quick Action Banner if Logged In */}
        {isAdmin && (
          <div className="mt-10 p-4 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-amber-400/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>ADMIN ACTIVE:</strong> You can edit any website text, change layout, or customize background in the Admin Panel.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAdmin('content')}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono rounded border border-zinc-700 transition-colors cursor-pointer"
              >
                Edit Site Text
              </button>
              <button
                onClick={() => onOpenAdmin('add')}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Work</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
