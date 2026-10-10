import { useState, useMemo } from 'react';
import { Project, ProjectCategory } from '../types/portfolio';
import { PROJECTS_DATA } from '../data/projectsData';
import { ArrowUpRight, Eye } from 'lucide-react';

interface WorkGalleryProps {
  onSelectProject: (project: Project) => void;
}

export const WorkGallery = ({ onSelectProject }: WorkGalleryProps) => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');

  const categories: { id: ProjectCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Works', count: PROJECTS_DATA.length },
    { id: 'identity', label: 'Visual Identity', count: PROJECTS_DATA.filter((p) => p.category === 'identity').length },
    { id: 'film', label: 'Film & Motion Edit', count: PROJECTS_DATA.filter((p) => p.category === 'film').length },
    { id: 'editorial', label: 'Editorial & Monograph', count: PROJECTS_DATA.filter((p) => p.category === 'editorial').length },
    { id: 'motion', label: 'Spatial & 3D Motion', count: PROJECTS_DATA.filter((p) => p.category === 'motion').length }
  ];

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return PROJECTS_DATA;
    return PROJECTS_DATA.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="work" className="py-20 lg:py-28 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
              Portfolio & Gallery Archive
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
              01. Selected Works & Commissions
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl font-light">
              A curated catalog of visual identity systems, long-form film edits, tactile publications, and architectural 3D motion direction.
            </p>
          </div>

          {/* Interactive Filter Tabs / Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-zinc-100 text-black shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] tabular-nums ${activeCategory === cat.id ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bento Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          {filteredProjects.map((project, idx) => {
            // Assign span based on index for dynamic bento rhythm
            const isWide = idx === 0 || idx === 3;
            const colSpan = isWide ? 'lg:col-span-7' : 'lg:col-span-5';

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`${colSpan} group cursor-pointer flex flex-col justify-between rounded-xl bg-zinc-900/40 border border-zinc-800/90 hover:border-zinc-600 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl`}
              >
                {/* Media Container */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    onError={(e) => {
                      // Fallback gradient if media fails
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('bg-zinc-900', 'flex', 'items-center', 'justify-center');
                      }
                    }}
                  />
                  
                  {/* Subtle Media Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f14] via-transparent to-transparent opacity-80" />

                  {/* Hover Floating Quick View Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
                    <span className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-md shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Case Study & Deliverables</span>
                    </span>
                  </div>

                  {/* Year & Metric quiet indicator */}
                  {project.metrics && (
                    <div className="absolute top-3 right-3 text-[11px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-800">
                      {project.metrics}
                    </div>
                  )}
                </div>

                {/* Content Box (Strict Zero-Pill Metadata) */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    {/* Unboxed Metadata with Typographic Separator */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2 font-mono">
                      <span className="text-amber-400 font-medium">{project.categoryLabel}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="tabular-nums text-zinc-400">{project.year}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="truncate">{project.client}</span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight mb-2">
                      {project.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 font-light">
                      {project.summary}
                    </p>
                  </div>

                  {/* Footer Action Strip */}
                  <div className="pt-4 mt-4 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400 group-hover:text-zinc-200">
                    <span className="font-mono text-[11px] text-zinc-500">
                      Role: {project.role.split('&')[0]}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Archive Counter Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-500 font-mono">
            DISPLAYING {filteredProjects.length} OF {PROJECTS_DATA.length} ARCHIVAL WORKS · ADDITIONAL CASE STUDIES AVAILABLE UNDER NDA
          </p>
        </div>
      </div>
    </section>
  );
};
