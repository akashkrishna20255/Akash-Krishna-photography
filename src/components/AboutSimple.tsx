import { Edit2 } from 'lucide-react';
import { SiteContent } from '../types/gallery';

interface AboutSimpleProps {
  aboutContent: SiteContent['about'];
  isAdmin: boolean;
  onOpenAdmin: (tab: 'content') => void;
}

export const AboutSimple = ({ aboutContent, isAdmin, onOpenAdmin }: AboutSimpleProps) => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-black border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Portrait Visual Frame */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl group">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={aboutContent.portraitUrl}
                  alt={aboutContent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>AKASH KRISHNA</span>
                <span className="text-zinc-500">CREATIVE STUDIO</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Experience */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                  {aboutContent.badge}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => onOpenAdmin('content')}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Bio</span>
                  </button>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 uppercase">
                {aboutContent.title}
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-zinc-300 font-light leading-relaxed mb-8">
                <p>{aboutContent.bio1}</p>
                {aboutContent.bio2 && <p>{aboutContent.bio2}</p>}
              </div>

              {/* Skills & Software Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-900 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block mb-1">BRAND DESIGN</span>
                  <span className="text-zinc-200">{aboutContent.skillBrand}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">POST-PRODUCTION</span>
                  <span className="text-zinc-200">{aboutContent.skillPost}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">3D & MOTION</span>
                  <span className="text-zinc-200">{aboutContent.skillMotion}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-8 pt-6 border-t border-zinc-900 grid grid-cols-3 gap-6">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {aboutContent.stat1Value}
                </span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">
                  {aboutContent.stat1Label}
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {aboutContent.stat2Value}
                </span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">
                  {aboutContent.stat2Label}
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {aboutContent.stat3Value}
                </span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">
                  {aboutContent.stat3Label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
