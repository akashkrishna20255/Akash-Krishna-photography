import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer = () => {
  const [times, setTimes] = useState({ ny: '', berlin: '' });

  useEffect(() => {
    const updateTime = () => {
      try {
        const ny = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date());

        const berlin = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date());

        setTimes({ ny, berlin });
      } catch (e) {
        // Fallback
        setTimes({ ny: '14:26', berlin: '20:26' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 bg-[#08090c] text-zinc-400 text-xs border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Quiet Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-center sm:text-left">
          <span className="font-bold tracking-tight text-white uppercase text-sm">
            ELENA VANCE STUDIO
          </span>
          <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-zinc-400 font-light">
            © {new Date().getFullYear()} All Rights Reserved. Monograph & Moving Image Archive.
          </span>
        </div>

        {/* Center: Live Studio Clocks */}
        <div className="flex items-center gap-6 font-mono text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-400">NEW YORK (EDT): </span>
            <span className="text-zinc-200 tabular-nums">{times.ny || '12:00:00'}</span>
          </div>
          <span className="text-zinc-600" aria-hidden="true">·</span>
          <div>
            <span className="text-zinc-400">BERLIN (CEST): </span>
            <span className="text-zinc-200 tabular-nums">{times.berlin || '18:00:00'}</span>
          </div>
        </div>

        {/* Right: Back to top button */}
        <div className="flex items-center gap-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
            aria-label="Back to top"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
