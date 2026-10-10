import { Camera, Film, Palette, Layers, Award, CheckCircle2 } from 'lucide-react';

export const AboutSimple = () => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-black border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Portrait Visual Frame */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl group">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="/src/assets/images/hero_designer_portrait_1791613619703.jpg"
                  alt="Akash Krishna, Visual Designer & Editor"
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
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2">
                Biography
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 uppercase">
                About the Studio
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-zinc-300 font-light leading-relaxed mb-8">
                <p>
                  I am a multidisciplinary visual designer and film editor creating brand systems, high-retention moving image sequences, and editorial publications for culture-forward brands and artists.
                </p>
                <p>
                  My methodology is rooted in structural restraint: stripping away ornamentation so the core narrative speaks with authority. Whether color grading a cinema short or structuring a 200-page book, I strive for clarity, tension, and craftsmanship.
                </p>
              </div>

              {/* Skills & Software Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-900 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block mb-1">BRAND DESIGN</span>
                  <span className="text-zinc-200">Figma, Illustrator, Glyphs</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">POST-PRODUCTION</span>
                  <span className="text-zinc-200">Premiere, DaVinci Resolve</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">3D & MOTION</span>
                  <span className="text-zinc-200">After Effects, Cinema 4D</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-8 pt-6 border-t border-zinc-900 grid grid-cols-3 gap-6">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">08+</span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">Years Experience</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">50+</span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">Projects Delivered</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">100%</span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-1 uppercase">Client Retention</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
