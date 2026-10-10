import { ArrowUp } from 'lucide-react';

export const FooterSimple = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-10 bg-black border-t border-zinc-900 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-zinc-300 font-semibold uppercase tracking-wider">
            AKASH KRISHNA
          </span>
          <span className="text-zinc-600 mx-2">·</span>
          <span>Visual Designer & Film Editor © {new Date().getFullYear()}</span>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800 text-[11px] font-mono"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
