import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Zap, Layers, Compass } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import type { SearchResult } from '../types';

interface InteractiveCardProps {
  doc: SearchResult;
  index: number;
  onOpen: (doc: SearchResult) => void;
  onMoreLikeThis: (tag: string) => void;
}

const InteractiveFloatingCard: React.FC<InteractiveCardProps> = ({
  doc,
  index,
  onOpen,
  onMoreLikeThis,
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${
          isHovered ? '-6px' : '0px'
        })`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
      }}
      className="interactive-card relative rounded-2xl glass-panel p-6 border transition-colors duration-300 text-left flex flex-col justify-between group overflow-hidden shadow-2xl"
    >
      {/* Glow highlight on hover */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl ${
          isHovered
            ? 'opacity-100 bg-gradient-to-br from-cyan-400/10 via-transparent to-amber-500/10 border-cyan-400/40'
            : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <div>
        {/* Eyebrow & score indicator */}
        <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono text-cyan-300/80">
          <div className="flex items-center gap-1.5">
            <span>DOC #{doc.id}</span>
            <span className="text-white/30">·</span>
            <span>{doc.docLength} tokens</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[10px] uppercase">Score</span>
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-300 rounded-full"
                style={{ width: `${Math.min(100, Math.round(doc.score * 100))}%` }}
              />
            </div>
            <span className="text-white font-bold text-xs">{doc.score.toFixed(3)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-sans-clean text-white group-hover:text-cyan-200 transition-colors mb-2 leading-snug">
          {doc.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans-clean mb-4 line-clamp-3">
          {doc.snippet}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5 text-[11px] font-mono text-cyan-300/70">
          {doc.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
        <button
          onClick={() => onOpen(doc)}
          aria-label={`Open document: ${doc.title}`}
          className="px-4 py-2 rounded-full bg-white text-slate-900 font-semibold text-xs tracking-wide hover:bg-white/90 transition-all flex items-center gap-1.5 shadow"
        >
          <BookOpen size={13} />
          <span>Open</span>
        </button>

        <button
          onClick={() => {
            if (doc.tags[0]) onMoreLikeThis(doc.tags[0]);
          }}
          aria-label={`Find documents related to ${doc.tags[0] || doc.title}`}
          className="font-mono text-cyan-300 hover:text-cyan-100 transition-colors flex items-center gap-1 py-1 px-2"
        >
          <span>More like this</span>
          <Sparkles size={12} />
        </button>
      </div>
    </div>
  );
};

export const ResultsSection: React.FC = () => {
  const results = useSearchStore((s) => s.results);
  const latencyMs = useSearchStore((s) => s.latencyMs);
  const isSearching = useSearchStore((s) => s.isSearching);
  const didYouMean = useSearchStore((s) => s.didYouMean);
  const setQuery = useSearchStore((s) => s.setQuery);
  const performSearch = useSearchStore((s) => s.performSearch);
  const activeRanker = useSearchStore((s) => s.activeRanker);
  const simpleView = useSearchStore((s) => s.simpleView);
  const toggleSimpleView = useSearchStore((s) => s.toggleSimpleView);
  const openDocReader = useSearchStore((s) => s.openDocReader);

  const handleDidYouMeanClick = () => {
    if (didYouMean) {
      setQuery(didYouMean);
      performSearch(didYouMean);
    }
  };

  return (
    <section
      id="results"
      className="relative min-h-[140vh] w-full flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-32 pb-32 z-10"
      aria-label="Search Results Section"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Eyebrow & Status Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-400">
              02 — THE CROSSING / RESULTS
            </span>
            <span className="text-white/20" aria-hidden="true">|</span>
            <div className="flex items-center gap-2 text-xs font-mono text-white/80">
              <Zap size={13} className="text-amber-400" />
              <span>{latencyMs} ms</span>
              <span className="text-white/40">·</span>
              <span>{results.length} results</span>
              <span className="text-white/40">·</span>
              <span className="uppercase text-[10px] text-cyan-300 font-semibold">{activeRanker}</span>
            </div>
          </div>

          {/* Simple View / 3D Mode Toggle */}
          <button
            onClick={toggleSimpleView}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
              simpleView ? 'glass-pill-active font-semibold' : 'glass-pill text-white/80 hover:text-white'
            }`}
            aria-pressed={simpleView}
          >
            <Layers size={13} />
            <span>{simpleView ? 'Simple 2D View Active' : 'Switch to 2D List'}</span>
          </button>
        </div>

        {/* "Did you mean...?" Floating Bubble */}
        {didYouMean && (
          <div className="mb-8 p-3 px-5 rounded-2xl glass-panel border border-amber-400/40 text-xs sm:text-sm font-sans-clean text-amber-200 flex items-center gap-2.5 animate-fadeIn shadow-lg">
            <AlertCircle size={15} className="text-amber-400 shrink-0" />
            <span>Did you mean:</span>
            <button
              onClick={handleDidYouMeanClick}
              className="font-bold underline underline-offset-4 decoration-amber-400 text-white hover:text-amber-300 transition-colors"
            >
              {didYouMean}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isSearching && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 py-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-2xl glass-panel p-6 border border-white/10 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-white/10 rounded" />
                  <div className="h-6 w-3/4 bg-white/20 rounded" />
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-5/6 bg-white/10 rounded" />
                </div>
                <div className="h-8 w-28 bg-white/15 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Floating 3D Cards Grid (Default Interactive Mode) */}
        {!simpleView && !isSearching && (
          <div className="w-full">
            <div className="w-full text-center py-2 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-mono text-cyan-300/80">
                <Compass size={13} className="text-cyan-400" />
                <span>Underwater Index Cards · Hover to tilt in 3D · Click to inspect</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((doc, idx) => (
                <InteractiveFloatingCard
                  key={doc.id}
                  doc={doc}
                  index={idx}
                  onOpen={openDocReader}
                  onMoreLikeThis={(tag) => {
                    setQuery(tag);
                    performSearch(tag);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accessible 2D Results List (When simpleView is true) */}
        {simpleView && !isSearching && (
          <div className="w-full space-y-4">
            {results.length === 0 ? (
              <div className="w-full py-16 text-center glass-panel rounded-2xl border border-white/10 p-8">
                <p className="text-lg font-medium text-white/90 mb-2">No documents matched your query</p>
                <p className="text-sm text-white/60 mb-6 font-mono">
                  Try broader keywords, adjust the ranker to TF-IDF, or search "simd postings".
                </p>
              </div>
            ) : (
              results.map((doc) => (
                <article
                  key={doc.id}
                  className="w-full rounded-2xl glass-panel p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 text-left hover:scale-[1.01]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-mono text-cyan-400">
                    <div className="flex items-center gap-2">
                      <span>DOC #{doc.id}</span>
                      <span className="text-white/30">·</span>
                      <span>{doc.docLength} tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-[11px]">RELEVANCE</span>
                      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-amber-300 rounded-full"
                          style={{ width: `${Math.min(100, Math.round(doc.score * 100))}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{doc.score.toFixed(3)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-sans-clean text-white mb-2 hover:text-cyan-200 transition-colors">
                    {doc.title}
                  </h3>

                  <p className="text-sm text-white/70 leading-relaxed font-sans-clean mb-4">
                    {doc.snippet}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-cyan-300/70">
                      {doc.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (doc.tags[0]) {
                            setQuery(doc.tags[0]);
                            performSearch(doc.tags[0]);
                          }
                        }}
                        aria-label={`Find documents related to ${doc.tags[0] || doc.title}`}
                        className="font-mono text-cyan-300 hover:text-cyan-100 transition-colors flex items-center gap-1"
                      >
                        <span>More like this</span>
                        <Sparkles size={12} />
                      </button>
                      <button
                        onClick={() => openDocReader(doc)}
                        aria-label={`Read full document: ${doc.title}`}
                        className="px-4 py-2 rounded-full bg-white text-slate-900 font-semibold hover:bg-white/90 transition-all flex items-center gap-1.5"
                      >
                        <BookOpen size={13} />
                        <span>Read Full Doc</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
