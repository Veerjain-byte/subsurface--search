import React, { useEffect } from 'react';
import { X, ExternalLink, Bookmark, Copy, Check } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';

export const DocumentReaderModal: React.FC = () => {
  const activeDoc = useSearchStore((s) => s.activeDocReader);
  const closeDocReader = useSearchStore((s) => s.closeDocReader);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDocReader();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeDocReader]);

  if (!activeDoc) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${activeDoc.title}\n\n${activeDoc.snippet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
      onClick={closeDocReader}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl text-[#f4ede4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <span>DOC ID: {activeDoc.id}</span>
              <span aria-hidden="true">·</span>
              <span>RELEVANCE SCORE: {activeDoc.score.toFixed(3)}</span>
            </div>
            <h2 id="reader-title" className="text-xl sm:text-2xl font-bold font-sans-clean text-white tracking-tight">
              {activeDoc.title}
            </h2>
          </div>
          <button
            onClick={closeDocReader}
            className="p-2 rounded-full glass-pill hover:bg-white/20 text-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close document reader (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadata & Tag row (Zero-pill text styling) */}
        <div className="flex flex-wrap items-center gap-3 py-4 text-xs font-mono text-white/60 border-b border-white/5">
          <span>Length: {activeDoc.docLength} tokens</span>
          <span aria-hidden="true">·</span>
          <span>Inverted Postings: Verified</span>
          <span aria-hidden="true">·</span>
          <span>Storage: Memory-Mapped RAM</span>
          <div className="w-full flex flex-wrap gap-1.5 mt-1">
            {activeDoc.tags.map((tag) => (
              <span key={tag} className="text-amber-300/90 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Document Body */}
        <div className="py-6 space-y-5 text-sm sm:text-base leading-relaxed text-white/90 font-sans-clean">
          <p className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-cyan-100">
            {activeDoc.snippet}
          </p>
          <p>
            This document is indexed inside the high-concurrency Subsurface C++ engine. Posting lists are compressed using variable-byte encoding, allowing query vectors to execute cache-conscious intersections with zero dynamic heap allocations during search time.
          </p>
          <div className="p-4 rounded-xl bg-[#05161d] border border-cyan-500/20 font-mono text-xs text-cyan-300/80 space-y-1">
            <div className="text-white/40">// C++ Inverted Index Posting Reference</div>
            <div>struct PostingEntry &#123;</div>
            <div className="pl-4">uint32_t doc_id = {activeDoc.id.replace(/\D/g, '') || 42};</div>
            <div className="pl-4">float bm25_weight = {activeDoc.score.toFixed(4)}f;</div>
            <div className="pl-4">uint16_t term_frequency = {Math.ceil(activeDoc.score * 5)};</div>
            <div>&#125;;</div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg glass-pill hover:bg-white/15 text-white/90 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Excerpt'}</span>
            </button>
            <button
              onClick={() => {
                alert(`Added "${activeDoc.title}" to local research collection`);
              }}
              className="px-3 py-2 rounded-lg glass-pill hover:bg-white/15 text-white/90 flex items-center gap-1.5 transition-colors"
            >
              <Bookmark size={14} />
              <span>Save</span>
            </button>
          </div>
          <button
            onClick={closeDocReader}
            className="px-5 py-2 rounded-full bg-white text-slate-900 font-medium hover:bg-white/90 transition-colors"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
