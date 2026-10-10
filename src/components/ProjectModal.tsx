import { useEffect } from 'react';
import { Project } from '../types/portfolio';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0e0f14] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-auto text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-semibold">{project.categoryLabel}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{project.year}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="truncate">{project.client}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Case Study"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[82vh] overflow-y-auto">
          {/* Main Visual Image */}
          <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f14] via-transparent to-transparent opacity-90" />
            
            {project.metrics && (
              <div className="absolute bottom-4 left-6 bg-black/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-amber-400 px-3 py-1.5 rounded">
                KEY OUTCOME: {project.metrics}
              </div>
            )}
          </div>

          {/* Case Study Details */}
          <div className="p-6 sm:p-10 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                {project.title}
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-light">
                {project.summary}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
              <div>
                <span className="text-zinc-500 font-mono block mb-1">ROLE</span>
                <span className="text-zinc-200 font-medium">{project.role}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block mb-1">CLIENT</span>
                <span className="text-zinc-200 font-medium">{project.client}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block mb-1">TIMELINE</span>
                <span className="text-zinc-200 font-medium">{project.year} Release</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block mb-1">DISCIPLINE</span>
                <span className="text-zinc-200 font-medium">{project.categoryLabel}</span>
              </div>
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2">
                  The Creative Challenge
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                  {project.challenge}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2">
                  The Editorial Solution
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Deliverables List */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3">
                Key Scope & Deliverables
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Testimonial if present */}
            {project.quote && (
              <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
                <p className="text-zinc-200 italic font-serif-display text-base sm:text-lg mb-3">
                  "{project.quote.text}"
                </p>
                <div className="text-xs font-mono text-zinc-400">
                  <span className="text-white font-medium">{project.quote.author}</span>
                  <span className="text-zinc-600 mx-2">·</span>
                  <span>{project.quote.role}</span>
                </div>
              </div>
            )}

            {/* Tool Stack Tags (Zero-Pill discipline: unboxed or clean segmented tags) */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500">PRODUCTION SUITE:</span>
                <div className="flex flex-wrap gap-2 text-zinc-300 font-mono text-[11px]">
                  {project.tools.join(' · ')}
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 hover:bg-amber-400 text-black font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
