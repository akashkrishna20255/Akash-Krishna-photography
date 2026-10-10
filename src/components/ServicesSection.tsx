import { ArrowUpRight, Edit2 } from 'lucide-react';
import { ServiceItem } from '../types/gallery';

interface ServicesSectionProps {
  services: ServiceItem[];
  isAdmin: boolean;
  onOpenAdmin: (tab: 'content') => void;
}

export const ServicesSection = ({ services, isAdmin, onOpenAdmin }: ServicesSectionProps) => {
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-20 lg:py-28 bg-black border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                Capabilities
              </span>
              {isAdmin && (
                <button
                  onClick={() => onOpenAdmin('content')}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Services</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans uppercase">
              Areas of Expertise
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
            Providing end-to-end creative direction from initial brand strategy to final cinema and print deliverables.
          </p>
        </div>

        {/* Services List */}
        <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
          {services.map((service) => (
            <div
              key={service.id || service.number}
              className="group py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start hover:bg-zinc-950/40 transition-colors px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-lg"
            >
              <div className="md:col-span-2 text-zinc-600 font-mono text-sm sm:text-base group-hover:text-white transition-colors">
                {service.number} /
              </div>

              <div className="md:col-span-5">
                <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-2">
                  <span>{service.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
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
