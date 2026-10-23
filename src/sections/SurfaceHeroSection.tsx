import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Sparkles, Filter, Sliders } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useSearchStore } from '../store/useSearchStore';
import { api } from '../api/client';
import type { Suggestion, RankerType, SearchMode } from '../types';
import { proceduralAudio } from '../utils/audio';

export const SurfaceHeroSection: React.FC = () => {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const activeRanker = useSearchStore((s) => s.activeRanker);
  const setRanker = useSearchStore((s) => s.setRanker);
  const activeMode = useSearchStore((s) => s.activeMode);
  const setMode = useSearchStore((s) => s.setMode);
  const performSearch = useSearchStore((s) => s.performSearch);
  const triggerDive = useSearchStore((s) => s.triggerDive);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<number | null>(null);

  // "/" keyboard shortcut to focus search input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Debounced 200ms autocomplete fetching
  useEffect(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = window.setTimeout(async () => {
      const results = await api.getSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    }, 200);

    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery !== undefined ? customQuery : query;
    proceduralAudio.playClickSound();
    proceduralAudio.playDiveSound();
    performSearch(finalQuery);
    setShowSuggestions(false);
    triggerDive('results');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex].text;
      setQuery(selected);
      handleSubmit(undefined, selected);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <section
      id="surface"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-24 pb-16 z-10"
      aria-label="Surface Search Hero"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Tiny Uppercase Tracked Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-[0.2em] uppercase text-amber-300/90 shadow-sm">
          <span>{SITE_CONFIG.eyebrow}</span>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span>01 — THE SURFACE</span>
        </div>

        {/* Big Mixed-Font Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 select-none">
          <span className="block font-serif-italic font-normal text-amber-200/95 text-glow leading-[1.05]">
            {SITE_CONFIG.taglineFirstLine}
          </span>
          <span className="block font-sans-clean font-extrabold uppercase tracking-tight text-white/95 leading-[1.05]">
            {SITE_CONFIG.taglineSecondLine}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-white/70 font-sans-clean font-light leading-relaxed mb-10 text-balance">
          {SITE_CONFIG.subtitle}
        </p>

        {/* Large Glass Search Bar */}
        <div className="w-full max-w-2xl relative mb-6">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="relative flex items-center w-full rounded-2xl glass-panel p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-400/80 focus-within:border-amber-400/50 shadow-2xl"
          >
            <div className="pl-3.5 pr-2 text-white/50" aria-hidden="true">
              <Search size={22} className="text-amber-300" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search inverted index, algorithms, data structures..."
              className="flex-1 bg-transparent px-2 py-3 text-sm sm:text-base md:text-lg text-white placeholder-white/40 focus:outline-none font-sans-clean"
              aria-label="Search query"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Keyboard shortcut hint */}
            <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 rounded bg-white/10 text-[10px] font-mono text-white/50">
              <span>/</span>
            </div>

            {/* Pure white pill "Search" button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-xs sm:text-sm tracking-wide uppercase hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span>Search</span>
              <CornerDownLeft size={14} className="opacity-70" />
            </button>
          </form>

          {/* Autocomplete Dropdown styled as floating glass */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel rounded-2xl overflow-hidden border border-white/20 shadow-2xl py-2 animate-fadeIn text-left">
              <div className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 flex justify-between items-center">
                <span>Dictionary Suggestions</span>
                <span>Use ↑↓ to navigate · ↵ to dive</span>
              </div>
              <ul role="listbox" aria-label="Search suggestions">
                {suggestions.map((item, idx) => (
                  <li
                    key={item.text}
                    role="option"
                    aria-selected={idx === selectedIndex}
                    onClick={() => {
                      setQuery(item.text);
                      handleSubmit(undefined, item.text);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-colors ${
                      idx === selectedIndex ? 'bg-white/15 text-amber-300 font-medium' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Search size={14} className="text-white/40" />
                      <span className="font-sans-clean">{item.text}</span>
                    </div>
                    {item.category && (
                      <span className="text-[11px] font-mono text-white/40">
                        {item.category}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Filter Pills (Ranker and Mode) */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/70">
          {/* Ranker Selector */}
          <div className="flex items-center gap-1 p-1 rounded-full glass-pill">
            <span className="px-2 text-[10px] uppercase tracking-wider text-white/40">Ranker:</span>
            <button
              onClick={() => setRanker('bm25')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                activeRanker === 'bm25'
                  ? 'glass-pill-active font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              BM25
            </button>
            <button
              onClick={() => setRanker('tfidf')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                activeRanker === 'tfidf'
                  ? 'glass-pill-active font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              TF-IDF
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-full glass-pill">
            <span className="px-2 text-[10px] uppercase tracking-wider text-white/40">Mode:</span>
            {(['free', 'boolean', 'phrase'] as SearchMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${
                  activeMode === mode
                    ? 'glass-pill-active font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested exploration tags */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-white/50">
          <span>Try queries:</span>
          {['b-tree index', 'simd inverted postings', 'min-heap top-k', 'robin hood hashing'].map((suggested) => (
            <button
              key={suggested}
              onClick={() => {
                setQuery(suggested);
                handleSubmit(undefined, suggested);
              }}
              className="text-amber-300/80 hover:text-amber-200 underline underline-offset-4 decoration-amber-500/30 transition-colors"
            >
              "{suggested}"
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
