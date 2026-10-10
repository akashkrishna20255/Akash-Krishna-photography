import { Lock, Unlock, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Navbar = ({ isAdmin, onOpenAdmin }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900 py-4 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand Wordmark */}
        <button
          onClick={() => scrollTo('top')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-base sm:text-lg font-bold tracking-tight text-white uppercase block group-hover:text-zinc-300 transition-colors">
            AKASH KRISHNA
          </span>
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase block font-mono">
            Visual Designer & Editor
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-zinc-400">
          <button
            onClick={() => scrollTo('gallery')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Admin Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className={`px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-all cursor-pointer border ${
              isAdmin
                ? 'bg-zinc-800 text-amber-400 border-amber-400/50 hover:bg-zinc-700'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
            title={isAdmin ? 'Admin Mode Active' : 'Admin Login'}
          >
            {isAdmin ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Admin Panel</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-400 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-5 flex flex-col gap-4 mt-2">
          <button
            onClick={() => scrollTo('gallery')}
            className="text-left text-sm uppercase tracking-wider text-zinc-300 hover:text-white py-1"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="text-left text-sm uppercase tracking-wider text-zinc-300 hover:text-white py-1"
          >
            About
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="text-left text-sm uppercase tracking-wider text-zinc-300 hover:text-white py-1"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
};
