import React, { useState } from 'react';
import { CosmicScaleLevel, CelestialBody } from '../types/celestial';
import { SCALE_LEVEL_INFO, CELESTIAL_BODIES } from '../data/celestialData';
import { cosmicAudio } from '../utils/audioSynthesizer';
import { 
  Orbit, 
  Search, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Compass, 
  GraduationCap, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface NavigationHeaderProps {
  currentScale: CosmicScaleLevel;
  onSelectScale: (scale: CosmicScaleLevel) => void;
  onSelectBody: (body: CelestialBody) => void;
  onOpenLearnModal: () => void;
  onResetView: () => void;
}

const SCALE_SEQUENCE: CosmicScaleLevel[] = [
  'earth_moon',
  'solar_system',
  'stellar_neighborhood',
  'milky_way',
  'local_group',
  'observable_universe',
];

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScale,
  onSelectScale,
  onSelectBody,
  onOpenLearnModal,
  onResetView,
}) => {
  const [isMuted, setIsMuted] = useState(cosmicAudio.getIsMuted());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState(false);

  const toggleSound = () => {
    const muted = cosmicAudio.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Filtered search bodies
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : CELESTIAL_BODIES.filter((b) => 
        b.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.typeLabelVi.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 7);

  const currentScaleMeta = SCALE_LEVEL_INFO[currentScale];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 md:p-4 flex flex-col gap-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Brand Logo & Observatory Title */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3.5 py-2 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/40">
            <Orbit className="w-5 h-5 animate-[spin_24s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent uppercase">
                Cosmic Explorer
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                3D WebGL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Đài Quan Sát & Mô Phỏng Vũ Trụ Toàn Cảnh
            </p>
          </div>
        </div>

        {/* Center: Search & Celestial Finder */}
        <div className="pointer-events-auto relative hidden md:block max-w-xs w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Tìm hành tinh, ngôi sao, thiên hà..."
              className="w-full bg-slate-950/80 border border-slate-700/60 focus:border-cyan-400 focus:outline-none rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 transition-colors backdrop-blur-md"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-950/95 border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/40 z-50 divide-y divide-slate-800/60 backdrop-blur-md">
              {searchResults.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectScale(b.scaleLevel);
                    onSelectBody(b);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-cyan-950/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.colorHex }}
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{b.nameVi} <span className="text-slate-400 text-[10px]">({b.name})</span></div>
                      <div className="text-[10px] text-cyan-400/80">{b.typeLabelVi}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1 shadow-lg backdrop-blur-md">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
            title="Tìm kiếm thiên thể"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Learn / Education Mode Button */}
          <button
            onClick={onOpenLearnModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Học tập</span>
          </button>

          {/* Reset Camera View */}
          <button
            onClick={onResetView}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Quay lại góc nhìn toàn cảnh"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Audio Soundscape Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              !isMuted 
                ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-sm shadow-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={isMuted ? 'Bật âm thanh không gian' : 'Tắt âm thanh'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors hidden sm:block cursor-pointer"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Search Popover */}
      {isSearchOpen && (
        <div className="md:hidden pointer-events-auto bg-slate-950/95 border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm hành tinh, ngôi sao, thiên hà..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none rounded-lg pl-8 pr-8 py-2 text-xs text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <button
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 divide-y divide-slate-800 max-h-56 overflow-y-auto">
              {searchResults.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectScale(b.scaleLevel);
                    onSelectBody(b);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="w-full px-2 py-2 text-left flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.colorHex }} />
                    <span className="text-slate-200">{b.nameVi}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">{b.typeLabelVi}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cosmic Hierarchy Scale Selector Ribbon */}
      <div className="pointer-events-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1 shadow-lg backdrop-blur-md">
          {SCALE_SEQUENCE.map((lvl, idx) => {
            const isActive = currentScale === lvl;
            const meta = SCALE_LEVEL_INFO[lvl];
            return (
              <button
                key={lvl}
                onClick={() => {
                  cosmicAudio.playSelectSound();
                  onSelectScale(lvl);
                }}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {idx + 1}
                </span>
                <span>{meta.titleVi}</span>
              </button>
            );
          })}
        </div>

        {/* Current Scale Metric Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md text-[11px] font-mono text-cyan-300/90 shrink-0">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentScaleMeta.rangeVi}</span>
        </div>
      </div>
    </header>
  );
};
