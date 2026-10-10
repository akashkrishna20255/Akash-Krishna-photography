import { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, SkipForward } from 'lucide-react';

interface ReelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REEL_CHAPTERS = [
  {
    title: 'Act I: Anamorphic Darkness',
    project: 'Nocturne in G Minor (A24)',
    time: '00:00 - 00:32',
    image: '/src/assets/images/project_cinema_reel_1791613644291.jpg',
    colorLook: 'Kodak 2383 35mm'
  },
  {
    title: 'Act II: Tactile Materiality',
    project: 'Aetheri Haute Parfumerie',
    time: '00:32 - 01:05',
    image: '/src/assets/images/project_brand_identity_1791613631959.jpg',
    colorLook: 'Natural Diffused Studio'
  },
  {
    title: 'Act III: Kinetic Typography',
    project: 'Pompidou 3D Continuum',
    time: '01:05 - 01:30',
    image: '/src/assets/images/project_motion_graphics_1791613667936.jpg',
    colorLook: 'Chrome & Iridescent'
  },
  {
    title: 'Act IV: Architectural Stills',
    project: 'Form & Absence Monograph',
    time: '01:30 - 01:45',
    image: '/src/assets/images/project_editorial_book_1791613658263.jpg',
    colorLook: 'Swiss Duotone Silver'
  }
];

export const ReelModal = ({ isOpen, onClose }: ReelModalProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Automated progress advancement simulation when playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const currentChapter = REEL_CHAPTERS[activeChapterIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#090a0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-zinc-200 font-semibold tracking-wider">ELENA VANCE · 2026 DIRECTOR & EDITOR REEL</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="text-zinc-400 hidden sm:inline">4K UHD · 2.39:1 CINEMATIC</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Showreel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Area */}
        <div className="relative aspect-[21/9] sm:aspect-[2.39/1] bg-black overflow-hidden flex items-center justify-center">
          <img
            src={currentChapter.image}
            alt={currentChapter.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Letterbox Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Center Play Indicator on Pause */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                aria-label="Resume Playback"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            </div>
          )}

          {/* On-Screen Watermark & Act Overlay */}
          <div className="absolute top-4 left-6 text-xs font-mono text-zinc-300">
            <div className="text-amber-400 font-bold uppercase">{currentChapter.title}</div>
            <div className="text-zinc-400 text-[11px]">{currentChapter.project}</div>
          </div>

          <div className="absolute top-4 right-6 text-xs font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded border border-zinc-800">
            PROFILE: {currentChapter.colorLook}
          </div>

          {/* Subtle Timecode Stamp */}
          <div className="absolute bottom-4 left-6 font-mono text-xs text-zinc-300 tracking-wider">
            REC ● 00:01:{(progress % 45).toString().padStart(2, '0')}:12
          </div>
        </div>

        {/* Transport & Timeline Controls */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/80">
          {/* Progress Bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-4 cursor-pointer">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveChapterIndex((prev) => (prev + 1) % REEL_CHAPTERS.length)}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Next Chapter"
                aria-label="Next Chapter"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle Audio"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-xs font-mono text-zinc-400 ml-2">
                00:48 / 01:45
              </span>
            </div>

            {/* Chapter Selectors */}
            <div className="flex flex-wrap items-center gap-1.5">
              {REEL_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.title}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setProgress(idx * 25 + 5);
                  }}
                  className={`px-3 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                    activeChapterIndex === idx
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  Act {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
