import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Sun, Moon, Sunrise, Sunset, Eye, Menu, X, ArrowDown, Clock } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useSearchStore } from '../../store/useSearchStore';
import type { ThemePreset } from '../../types';

interface FixedChromeProps {
  onNavigate: (sectionId: string) => void;
}

export const FixedChrome: React.FC<FixedChromeProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const scrollProgress = useSearchStore((s) => s.scrollProgress);
  const audioEnabled = useSearchStore((s) => s.audioEnabled);
  const toggleAudio = useSearchStore((s) => s.toggleAudio);
  const quality = useSearchStore((s) => s.quality);
  const setQuality = useSearchStore((s) => s.setQuality);
  const theme = useSearchStore((s) => s.theme);
  const setTheme = useSearchStore((s) => s.setTheme);
  const timeOfDay = useSearchStore((s) => s.timeOfDay);
  const targetTimeOfDay = useSearchStore((s) => s.targetTimeOfDay);
  const setTargetTimeOfDay = useSearchStore((s) => s.setTargetTimeOfDay);
  const followLocalTime = useSearchStore((s) => s.followLocalTime);
  const setFollowLocalTime = useSearchStore((s) => s.setFollowLocalTime);
  const simpleView = useSearchStore((s) => s.simpleView);
  const toggleSimpleView = useSearchStore((s) => s.toggleSimpleView);
  const activeSection = useSearchStore((s) => s.activeSection);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setTimePopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTimePopoverOpen(false);
    };
    if (timePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [timePopoverOpen]);

  // Format time of day into 24h clock string
  const hours = Math.floor(timeOfDay * 24) % 24;
  const minutes = Math.floor((timeOfDay * 24 - Math.floor(timeOfDay * 24)) * 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const cycleQuality = () => {
    if (quality === 'high') setQuality('medium');
    else if (quality === 'medium') setQuality('low');
    else setQuality('high');
  };

  const isNight = timeOfDay < 0.20 || timeOfDay > 0.82;
  const isGoldenOrDusk = timeOfDay >= 0.65 && timeOfDay <= 0.82;
  const isDawn = timeOfDay >= 0.20 && timeOfDay < 0.35;

  const presets: Array<{ name: string; preset: ThemePreset; target: number }> = [
    { name: 'Dawn', preset: 'dawn', target: 0.25 },
    { name: 'Noon', preset: 'noon', target: 0.50 },
    { name: 'Golden', preset: 'golden', target: 0.70 },
    { name: 'Dusk', preset: 'dusk', target: 0.78 },
    { name: 'Night', preset: 'night', target: 0.04 },
  ];

  return (
    <>
      {/* Top Bar Chrome */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none bg-gradient-to-b from-[#070b10]/95 via-[#070b10]/60 to-transparent backdrop-blur-[2px]">
        {/* Top-left Wordmark */}
        <button
          onClick={() => onNavigate('surface')}
          className="pointer-events-auto group flex items-baseline gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1 transition-opacity"
          aria-label="Subsurface search home"
        >
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white/95 font-sans-clean">
            {SITE_CONFIG.brandName.toLowerCase()}
          </span>
          <span className="text-xl md:text-2xl font-serif-italic text-amber-400 group-hover:text-amber-300 transition-colors">
            {SITE_CONFIG.brandSuffix}
          </span>
        </button>

        {/* Top-right Navigation Links (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-7 pointer-events-auto px-5 py-2 rounded-full glass-pill text-xs font-medium tracking-wide uppercase text-white/70"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => onNavigate('surface')}
            className={`transition-colors hover:text-white ${activeSection === 'surface' ? 'text-amber-400 font-semibold' : ''}`}
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('results')}
            className={`transition-colors hover:text-white ${activeSection === 'results' || activeSection === 'dive' ? 'text-cyan-300 font-semibold' : ''}`}
          >
            Results
          </button>
          <button
            onClick={() => onNavigate('under-the-hood')}
            className={`transition-colors hover:text-white ${activeSection === 'hood' ? 'text-cyan-300 font-semibold' : ''}`}
          >
            Under the Hood
          </button>
          <button
            onClick={() => onNavigate('index')}
            className={`transition-colors hover:text-white ${activeSection === 'index' ? 'text-cyan-300 font-semibold' : ''}`}
          >
            Index
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-full glass-pill text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#070b10]/95 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden">
          <div className="flex flex-col gap-6 text-xl uppercase tracking-widest font-mono text-white/80">
            <button
              onClick={() => {
                onNavigate('surface');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-amber-400 py-2 border-b border-white/10"
            >
              01 · Search
            </button>
            <button
              onClick={() => {
                onNavigate('results');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-cyan-300 py-2 border-b border-white/10"
            >
              02 · Results
            </button>
            <button
              onClick={() => {
                onNavigate('under-the-hood');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-cyan-300 py-2 border-b border-white/10"
            >
              03 · Under the Hood
            </button>
            <button
              onClick={() => {
                onNavigate('index');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-cyan-300 py-2 border-b border-white/10"
            >
              04 · Index Management
            </button>
          </div>
        </div>
      )}

      {/* Bottom-left Frosted Pill: Live Index Stats */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-auto hidden sm:block">
        <div className="px-4 py-2 rounded-full glass-pill text-xs font-mono tracking-tight text-white/80 flex items-center gap-2 shadow-lg">
          <span className="text-white font-medium">{SITE_CONFIG.defaultStats.docsCount.toLocaleString()}</span>
          <span className="text-white/40">docs</span>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="text-white font-medium">{SITE_CONFIG.defaultStats.termsCount.toLocaleString()}</span>
          <span className="text-white/40">terms</span>
        </div>
      </div>

      {/* Bottom-center: "SCROLL TO DESCEND" hint */}
      <div
        className={`fixed bottom-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 flex flex-col items-center gap-1.5 ${
          scrollProgress > 0.08 ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-85 translate-y-0'
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.25em] font-mono text-white/70 uppercase">
          Scroll to descend
        </span>
        <ArrowDown size={14} className="text-amber-400 animate-bounce" />
      </div>

      {/* Time of Day Popover Container */}
      <div ref={popoverRef} className="fixed bottom-6 right-6 z-40 pointer-events-auto flex items-center gap-2">
        {timePopoverOpen && (
          <div className="absolute bottom-14 right-0 w-72 rounded-2xl glass-panel p-4 border border-white/20 shadow-2xl animate-fadeIn text-left select-none">
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300">
                <Clock size={13} />
                <span>Time of Day</span>
              </div>
              <span className="font-mono text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                {timeString}
              </span>
            </div>

            {/* Continuous Time Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={targetTimeOfDay}
                onChange={(e) => setTargetTimeOfDay(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                aria-label="Time of day continuous slider"
              />
            </div>

            {/* Preset Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {presets.map((p) => {
                const isActive = theme === p.preset;
                return (
                  <button
                    key={p.name}
                    onClick={() => setTheme(p.preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow'
                        : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Follow Local Time Toggle */}
            <label className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-white/70 cursor-pointer">
              <span>Follow local time</span>
              <input
                type="checkbox"
                checked={followLocalTime}
                onChange={(e) => setFollowLocalTime(e.target.checked)}
                className="rounded accent-amber-400 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Simple 2D View Toggle */}
        <button
          onClick={toggleSimpleView}
          className={`p-2.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            simpleView ? 'bg-cyan-500 text-[#070b10] font-bold shadow-lg shadow-cyan-500/25' : 'glass-pill text-white/70 hover:text-white'
          }`}
          title={simpleView ? 'Switch to 3D View' : 'Switch to Simple 2D View'}
          aria-label={simpleView ? 'Switch to 3D View' : 'Switch to Simple 2D View'}
        >
          <Eye size={15} />
        </button>

        {/* Quality Toggle */}
        <button
          onClick={cycleQuality}
          className="px-2.5 py-1.5 rounded-full glass-pill text-[11px] font-mono text-white/80 hover:text-white transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={`Rendering Quality: ${quality.toUpperCase()}`}
          aria-label={`Rendering Quality: ${quality}`}
        >
          <Sparkles size={13} className="text-amber-400" />
          <span className="uppercase text-[10px]">{quality}</span>
        </button>

        {/* Dynamic Morphing Sun/Moon Time Control Button */}
        <button
          onClick={() => setTimePopoverOpen(!timePopoverOpen)}
          className={`p-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            timePopoverOpen
              ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/25 scale-105'
              : 'glass-pill text-white/80 hover:text-white'
          }`}
          title={`Time of Day: ${timeString} (Click to change)`}
          aria-label={`Time of Day: ${timeString}`}
          aria-expanded={timePopoverOpen}
        >
          {isNight ? (
            <Moon size={15} className="text-blue-300" />
          ) : isDawn ? (
            <Sunrise size={15} className="text-pink-300" />
          ) : isGoldenOrDusk ? (
            <Sunset size={15} className="text-amber-400" />
          ) : (
            <Sun size={15} className="text-yellow-400" />
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            audioEnabled ? 'glass-pill-active' : 'glass-pill text-white/70 hover:text-white'
          }`}
          title={audioEnabled ? 'Mute procedural ambience' : 'Enable procedural audio'}
          aria-label={audioEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>
    </>
  );
};
