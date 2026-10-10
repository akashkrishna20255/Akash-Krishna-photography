import { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Film, Volume2, VolumeX, Eye } from 'lucide-react';

interface LUTGrade {
  id: string;
  name: string;
  description: string;
  filterStyle: string;
  temp: string;
  tint: string;
  contrast: string;
}

const LUT_GRADES: LUTGrade[] = [
  {
    id: 'kodak-2383',
    name: 'Kodak 2383 Print Stock',
    description: 'Rich organic shadows, creamy warm skin highlights, classic 35mm photochemical film response.',
    filterStyle: 'contrast(1.22) saturate(1.15) sepia(0.12) brightness(0.96)',
    temp: '5600K',
    tint: '+2 Magenta',
    contrast: '+18%'
  },
  {
    id: 'rec709-flat',
    name: 'Log-C / Rec.709 Neutral',
    description: 'Uncompressed flat sensor dynamic range with neutral gray cards and faithful color rendition.',
    filterStyle: 'contrast(1.0) saturate(1.0) brightness(1.0)',
    temp: '5000K',
    tint: '0.0 Neutral',
    contrast: '0.0 Flat'
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass Silver',
    description: 'Retained silver grain, gritty micro-contrast, desaturated chroma with stark highlights.',
    filterStyle: 'contrast(1.45) saturate(0.55) brightness(0.92)',
    temp: '4800K',
    tint: '-4 Green',
    contrast: '+35%'
  },
  {
    id: 'teal-amber',
    name: 'Teal & Amber Chiaroscuro',
    description: 'Anamorphic complementary separation: cool shadow depths and luminescent lantern glow.',
    filterStyle: 'contrast(1.28) saturate(1.25) hue-rotate(-8deg) brightness(0.94)',
    temp: '6200K',
    tint: '+8 Amber',
    contrast: '+24%'
  },
  {
    id: 'monochrome',
    name: 'Panatomic-X Monochrome',
    description: 'Photochemical black and white with deep velvet blacks and luminous architectural midtones.',
    filterStyle: 'grayscale(1) contrast(1.35) brightness(0.95)',
    temp: 'N/A',
    tint: 'N/A',
    contrast: '+40%'
  }
];

export const EditorSuiteDemo = () => {
  const [selectedLUT, setSelectedLUT] = useState<LUTGrade>(LUT_GRADES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubberPos, setScrubberPos] = useState(38); // 0 to 100
  const [splitSliderPos, setSplitSliderPos] = useState(50); // comparison slider
  const [showSplitComparison, setShowSplitComparison] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Timecode calculation based on scrubber
  const totalFrames = 3450;
  const currentFrame = Math.floor((scrubberPos / 100) * totalFrames);
  const seconds = Math.floor(currentFrame / 24);
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  const remFrames = currentFrame % 24;
  const timecode = `00:${String(minutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')}:${String(remFrames).padStart(2, '0')}`;

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="suite" className="py-20 lg:py-28 border-b border-zinc-800/80 bg-[#090a0d]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
              Craft & Precision
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
              The Editor's Suite & Color Science
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
              Interactive timeline and LUT color grading engine. Test custom photochemical print curves, compare Log sensor profiles, and inspect timeline pacing in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSplitComparison(!showSplitComparison)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                showSplitComparison
                  ? 'bg-amber-400 text-black border-amber-400 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showSplitComparison ? 'Split View Active' : 'Toggle Split Compare'}</span>
            </button>
          </div>
        </div>

        {/* Master Suite Monitor Container */}
        <div className="bg-[#0e0f14] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Top Bar of Suite Workspace */}
          <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="text-zinc-200 font-semibold">VIEWPORT 1: NOCTURNE IN G MINOR</span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">4K DCI ANAMORPHIC (2.39:1)</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-amber-400">TIMECODE: {timecode}</span>
              <span className="text-zinc-500">FPS: 23.976</span>
              <span className="text-zinc-500">COLOR SPACE: ACEScc</span>
            </div>
          </div>

          {/* Monitor Viewport with Active Grading */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[21/9] sm:aspect-[2.39/1] max-h-[520px] bg-black overflow-hidden select-none flex items-center justify-center"
          >
            {/* Base Image Container */}
            <div className="relative w-full h-full">
              <img
                src="/src/assets/images/project_cinema_reel_1791613644291.jpg"
                alt="Cinema edit color grading preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
                style={{
                  filter: showSplitComparison ? 'none' : selectedLUT.filterStyle
                }}
              />

              {/* Split Comparison Overlay */}
              {showSplitComparison && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `polygon(${splitSliderPos}% 0, 100% 0, 100% 100%, ${splitSliderPos}% 100%)`
                  }}
                >
                  <img
                    src="/src/assets/images/project_cinema_reel_1791613644291.jpg"
                    alt="Graded view comparison"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{
                      filter: selectedLUT.filterStyle
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-zinc-800">
                    GRADED: {selectedLUT.name}
                  </div>
                </div>
              )}

              {showSplitComparison && (
                <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
                  RAW LOG-C
                </div>
              )}

              {/* Split Divider Line */}
              {showSplitComparison && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-amber-400 cursor-ew-resize z-20 shadow-md"
                  style={{ left: `${splitSliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-bold shadow-lg">
                    ↔
                  </div>
                </div>
              )}

              {/* Cinema Anamorphic Grid Lines Overlay (Subtle) */}
              <div className="absolute inset-0 pointer-events-none opacity-20 border-y border-dashed border-zinc-400/40" />
            </div>

            {/* In-Frame Playhead Status */}
            <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>ACTIVE LOOK: <strong className="text-white font-semibold">{selectedLUT.name}</strong></span>
            </div>
          </div>

          {/* Interactive Split Slider Controller if Split Mode */}
          {showSplitComparison && (
            <div className="px-6 py-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span>RAW LOG (0%)</span>
              <input
                type="range"
                min="5"
                max="95"
                value={splitSliderPos}
                onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                className="flex-grow accent-amber-400 cursor-ew-resize h-1.5 bg-zinc-800 rounded-lg"
              />
              <span className="text-amber-400">GRADED (100%)</span>
            </div>
          )}

          {/* Scrubber Timeline & Audio Waveform */}
          <div className="p-4 sm:p-6 bg-[#0a0b0f] border-t border-zinc-800/80">
            <div className="flex flex-col gap-3">
              {/* Timeline Track */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => setScrubberPos(0)}
                  className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Reset to In-Point"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex-grow flex flex-col gap-1.5">
                  {/* Waveform Visualization Bars */}
                  <div className="h-6 w-full flex items-end gap-[2px] opacity-40 px-1 overflow-hidden pointer-events-none">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const height = 20 + Math.sin(i * 0.4) * 50 + (i % 5 === 0 ? 30 : 0);
                      const isPast = (i / 64) * 100 <= scrubberPos;
                      return (
                        <div
                          key={i}
                          className={`w-full rounded-t-sm transition-colors ${
                            isPast ? 'bg-amber-400' : 'bg-zinc-600'
                          }`}
                          style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber Input Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scrubberPos}
                    onChange={(e) => setScrubberPos(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Audio"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Time markers */}
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 px-12">
                <span>00:00:00:00 [IN]</span>
                <span className="text-amber-400 font-semibold">{timecode}</span>
                <span>00:02:24:00 [OUT]</span>
              </div>
            </div>
          </div>

          {/* Color LUT Profile Switcher Grid */}
          <div className="p-4 sm:p-6 bg-[#0c0d12] border-t border-zinc-800/80">
            <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider text-zinc-400 font-mono">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Color Timing Science Profile:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {LUT_GRADES.map((lut) => (
                <button
                  key={lut.id}
                  onClick={() => setSelectedLUT(lut)}
                  className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedLUT.id === lut.id
                      ? 'bg-zinc-800/90 border-amber-400 text-white shadow-md ring-1 ring-amber-400/30'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs tracking-tight text-white">{lut.name}</span>
                      {selectedLUT.id === lut.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                      {lut.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{lut.temp}</span>
                    <span className="text-zinc-400">{lut.contrast}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
