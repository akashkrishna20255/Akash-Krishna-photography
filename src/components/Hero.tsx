import { ArrowDown, Play, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenReel: () => void;
}

export const Hero = ({ onOpenReel }: HeroProps) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="pt-28 sm:pt-36 pb-16 lg:pb-24 border-b border-zinc-800/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Split Hero: Left Column Text & Right Column Media */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Editorial Kicker */}
              <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-amber-400 font-semibold mb-4">
                <span>Principal Visual Designer & Film Editor</span>
                <span className="text-zinc-600" aria-hidden="true">·</span>
                <span className="text-zinc-400">New York & Berlin</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.12] mb-6 font-sans [text-wrap:balance]">
                Sculpting tactile brand languages & cinematic moving image narratives.
              </h1>

              {/* Bio Prose */}
              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-light">
                Elena Vance collaborates with pioneering culture houses, cinema directors, and luxury brands to create identity systems of extreme typographic rigor and film edits calibrated with organic narrative tension.
              </p>

              {/* Focus Points Unboxed Meta */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs tracking-wide text-zinc-400 mb-8 border-t border-b border-zinc-800/80 py-3">
                <span className="text-zinc-200 font-medium">Core Disciplines</span>
                <span className="text-zinc-600" aria-hidden="true">/</span>
                <span>Visual Brand Identity</span>
                <span className="text-zinc-600" aria-hidden="true">/</span>
                <span>Narrative Film & Commercial Editing</span>
                <span className="text-zinc-600" aria-hidden="true">/</span>
                <span>Color Timing (Rec.709 & 35mm)</span>
                <span className="text-zinc-600" aria-hidden="true">/</span>
                <span>Monographs</span>
              </div>

              {/* CTA Action Cluster */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={() => scrollToSection('work')}
                  className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wide text-black bg-zinc-100 hover:bg-amber-400 rounded transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                >
                  <span>Explore Selected Archive</span>
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenReel}
                  className="px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wide text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 rounded transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer group"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black transition-colors">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>Watch 2026 Showreel</span>
                  <span className="text-zinc-500 text-xs">(01:45)</span>
                </button>
              </div>
            </div>

            {/* Subtle Availability Marker */}
            <div className="text-xs text-zinc-400 flex items-center gap-2 pt-4">
              <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              <span>Currently accepting 2 select commissions for Q3/Q4 2026</span>
            </div>
          </div>

          {/* Right Column: Framed Editorial Portrait Visual */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 shadow-2xl">
              <div className="aspect-[4/3] lg:aspect-[4/3.8] overflow-hidden relative">
                <img
                  src="/src/assets/images/hero_designer_portrait_1791613619703.jpg"
                  alt="Elena Vance, Principal Visual Designer & Film Editor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Visual Overlay Caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-xs text-zinc-300">
                  <div>
                    <p className="font-semibold text-white tracking-wide">Elena Vance</p>
                    <p className="text-zinc-400 text-[11px]">Creative Direction & Lead Editor Suite</p>
                  </div>
                  <button
                    onClick={onOpenReel}
                    className="px-2.5 py-1 text-[11px] bg-black/60 backdrop-blur-md border border-zinc-700 text-zinc-200 hover:text-white rounded hover:border-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>View Stills</span>
                  </button>
                </div>
              </div>

              {/* Caption Line Below Photo */}
              <div className="px-4 py-3 bg-[#0e0f14] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>ARCHIVE ID: EV-2026-PORTFOLIO</span>
                <span>BERLIN / MITTE STUDIO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Metric Strip below the split */}
        <div className="mt-16 pt-10 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums mb-1 font-sans">
              09<span className="text-amber-400">+</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Years Lead Direction
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Brand systems & post-production</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums mb-1 font-sans">
              48
            </div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Global Campaigns
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Across Europe, Asia & the Americas</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums mb-1 font-sans">
              14M<span className="text-amber-400">+</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Audience Reel Reach
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Theatrical and festival viewership</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums mb-1 font-sans">
              06
            </div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Industry Honors
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">D&AD, Cannes Lions, Tokyo TDC, ADC</p>
          </div>
        </div>
      </div>
    </section>
  );
};
