import { AWARDS_DATA, CLIENTS_DATA, TOOL_STACK } from '../data/projectsData';
import { Award as AwardIcon, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutSection = () => {
  const methodologies = [
    {
      step: '01',
      title: 'Monolithic Discovery',
      description: 'Stripping away decorative noise to isolate the singular psychological anchor of the brand or film script.'
    },
    {
      step: '02',
      title: 'Typographic Rigor',
      description: 'Drafting custom glyph sets and mathematical Swiss grid systems that give structure to complex publications and digital systems.'
    },
    {
      step: '03',
      title: 'Temporal Rhythm',
      description: 'Pacing edits to the natural cadence of breath, sound design, and sub-bass resonance, avoiding sterile algorithmic cuts.'
    },
    {
      step: '04',
      title: 'Materiality & Polish',
      description: 'Finishing with tactile unbleached paper stocks, photochemical 35mm film grain curves, and lossless spatial deliverables.'
    }
  ];

  return (
    <section id="about" className="py-20 lg:py-28 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
            Profile & Ethos
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans [text-wrap:balance]">
            02. Design Philosophy & Narrative Pacing
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg mt-4 leading-relaxed font-light">
            I work at the collision point between high-fashion editorial print, monumental brand identity, and cinematic film editing. Whether cutting an art-house feature or drafting a 300-page architectural monograph, the objective remains constant: permanence over fleeting trends.
          </p>
        </div>

        {/* 2-Column Split: Detailed Bio & Creative Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          {/* Bio Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            <p>
              Trained in typography and film editing at the Basel School of Design and the American Film Institute, I spent the last nine years bridging physical craftsmanship and digital post-production.
            </p>
            <p>
              In an era overwhelmed by disposable digital content and synthetic homogeny, I believe in work that commands physical presence: heavyweight cotton paper stocks that age with dignity, bespoke ligatures that cannot be synthesized by templates, and film sequences edited with the surgical restraint of master cinema.
            </p>
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2">
                STUDIO LOCATIONS & REPRESENTATION
              </div>
              <div className="text-xs text-zinc-400 flex flex-col gap-1 font-mono">
                <div>New York · Crosby Street, SoHo</div>
                <div>Berlin · Linienstraße, Mitte</div>
                <div>Commercial Film Rep · Art + Commerce Worldwide</div>
              </div>
            </div>
          </div>

          {/* 4-Step Methodology Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {methodologies.map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-amber-400/90 tracking-tight">
                    {item.step}.
                  </span>
                  <h3 className="text-base font-semibold text-white mt-2 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Stack & Capabilities */}
        <div className="mb-20 pt-12 border-t border-zinc-800/80">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
              Production Capabilities
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Discipline & Tool Stack
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOOL_STACK.map((item) => (
              <div
                key={item.discipline}
                className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.discipline}</span>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                  {item.tools.map((t) => (
                    <span key={t} className="bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Honors & Awards Section */}
        <div id="awards" className="mb-20 pt-12 border-t border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
                Industry Recognition
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Selected Honors & Distinctions
              </h3>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              2022 — 2025 SELECTED
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30 divide-y divide-zinc-800/70">
            {AWARDS_DATA.map((award, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                    {award.year}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {award.award}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Project: {award.project}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-400 text-left sm:text-right">
                  {award.organization}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Clients Roster */}
        <div className="pt-12 border-t border-zinc-800/80">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
              Select Collaborators & Commissioners
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Commission Roster
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CLIENTS_DATA.map((client) => (
              <div
                key={client.name}
                className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="font-semibold text-sm text-zinc-200">
                  {client.name}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  {client.industry} · {client.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
