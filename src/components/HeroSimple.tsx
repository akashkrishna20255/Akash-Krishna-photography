import { ArrowDown, ArrowUpRight, Sparkles, Plus } from 'lucide-react';

interface HeroSimpleProps {
  isAdmin: boolean;
  onOpenAdmin: () => void;
  photoCount: number;
}

export const HeroSimple = ({ isAdmin, onOpenAdmin, photoCount }: HeroSimpleProps) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="pt-32 sm:pt-40 pb-20 bg-black text-white border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Tag & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AKASH KRISHNA · AVAILABLE FOR COMMISSIONS 2026</span>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            SELECTED WORKS ARCHIVE ({photoCount})
          </div>
        </div>

        {/* Big Editorial Headline (Hostinger Portfolio Style) */}
        <div className="max-w-5xl mb-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight text-white leading-[1.05] uppercase">
            Visual Designer <br />
            <span className="text-zinc-500 font-normal">& Film Editor.</span>
          </h1>
        </div>

        {/* Bio & Actions Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-6 border-t border-zinc-900">
          <div className="md:col-span-7">
            <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed max-w-2xl">
              Hello, I am Akash Krishna. I craft minimalist brand identities, tactile editorial publications, and cinematic video edits with an obsession for light, structure, and emotional pacing.
            </p>
          </div>

          <div className="md:col-span-5 flex flex-wrap items-center gap-3 md:justify-end">
            <button
              onClick={() => scrollTo('gallery')}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Explore Gallery</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('contact')}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              Contact Me
            </button>
          </div>
        </div>

        {/* Admin Quick Banner if Logged In */}
        {isAdmin && (
          <div className="mt-10 p-4 rounded-xl bg-zinc-950 border border-amber-400/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>ADMIN ACTIVE:</strong> You can upload new photos or click "Edit" on any gallery card to update it.
              </span>
            </div>
            <button
              onClick={onOpenAdmin}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload New Work</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
