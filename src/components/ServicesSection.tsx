import { ArrowUpRight } from 'lucide-react';

export const ServicesSection = () => {
  const services = [
    {
      number: '01',
      title: 'Brand Systems & Visual Identity',
      description: 'Creating comprehensive visual design languages, custom wordmarks, grid structures, packaging systems, and digital brand guidelines.'
    },
    {
      number: '02',
      title: 'Film & Commercial Video Editing',
      description: 'Picture cutting, narrative pacing, rhythmic sound synchronization, match cuts, and professional 35mm photochemical color timing.'
    },
    {
      number: '03',
      title: 'Editorial Design & Print Monographs',
      description: 'Designing art publications, exhibition catalogs, and lookbooks with mathematical Swiss typography and tactile paper stocks.'
    },
    {
      number: '04',
      title: 'Motion Direction & 3D Spatial',
      description: 'Kinetic title sequences, fluid 3D simulations, broadcast graphics, and architectural video installations.'
    }
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-black border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2">
              Capabilities
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans uppercase">
              Areas of Expertise
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
            Providing end-to-end creative direction from initial brand strategy to final cinema and print deliverables.
          </p>
        </div>

        {/* Services List with Hover Accent */}
        <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
          {services.map((service) => (
            <div
              key={service.number}
              className="group py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start hover:bg-zinc-950/40 transition-colors px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-lg"
            >
              <div className="md:col-span-2 text-zinc-600 font-mono text-sm sm:text-base group-hover:text-amber-400 transition-colors">
                {service.number} /
              </div>

              <div className="md:col-span-5">
                <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-2">
                  <span>{service.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                </h3>
              </div>

              <div className="md:col-span-5 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                {service.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
