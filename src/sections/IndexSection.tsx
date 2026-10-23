import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2, Sparkles, Plus } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useToast } from '../components/ui/ToastNotification';
import type { IndexDoc } from '../types';

export const IndexSection: React.FC = () => {
  const indexedDocs = useSearchStore((s) => s.indexedDocs);
  const addIndexedDoc = useSearchStore((s) => s.addIndexedDoc);
  const removeIndexedDoc = useSearchStore((s) => s.removeIndexedDoc);
  const { showToast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sinkingFileName, setSinkingFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSinkingFileName(file.name);
    setIsUploading(true);
    setUploadProgress(10);

    // Simulated indexing progress ring
    const timer1 = setTimeout(() => setUploadProgress(45), 400);
    const timer2 = setTimeout(() => setUploadProgress(85), 900);
    const timer3 = setTimeout(() => {
      setUploadProgress(100);
      const newDoc: IndexDoc = {
        id: `doc-${Date.now().toString().slice(-4)}`,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        sizeBytes: file.size || 1048576 * 1.8,
        termsCount: Math.floor(Math.random() * 4000) + 1200,
        addedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'indexed',
        snippetPreview: `Parsed ${file.name}: Inverted postings generated with SIMD variable-byte delta compression.`,
      };

      addIndexedDoc(newDoc);
      setIsUploading(false);
      setSinkingFileName(null);
      setUploadProgress(0);
      showToast(`Indexed "${newDoc.title}" successfully (${newDoc.termsCount} terms added)`, 'success');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (doc: IndexDoc) => {
    removeIndexedDoc(doc.id);
    showToast(`Removed "${doc.title}" from inverted index`, 'info');
  };

  return (
    <section
      id="index"
      className="relative min-h-screen w-full flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-24 pb-28 z-10"
      aria-label="Index Management"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 shadow-sm">
          <span>04 — INDEX ARCHITECTURE & INGESTION</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans-clean text-white tracking-tight mb-4 text-center">
          Ingest & Submerge Documents
        </h2>
        <p className="max-w-xl text-sm sm:text-base text-white/70 font-sans-clean text-center mb-10">
          Drop research papers, specifications, or markdown corpora into the portal. Files sink beneath the surface, undergoing SIMD tokenization and B-tree leaf insertion.
        </p>

        {/* Glowing Portal Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-2xl rounded-3xl p-8 sm:p-12 mb-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
            isDragging
              ? 'border-2 border-cyan-400 bg-cyan-950/40 shadow-[0_0_40px_rgba(38,181,187,0.35)] scale-[1.02]'
              : 'border border-white/20 glass-panel hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(38,181,187,0.15)]'
          }`}
        >
          {/* Subtle animated water ripple ring in portal background */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl opacity-20 bg-gradient-to-b from-cyan-500/20 via-transparent to-amber-500/10 group-hover:opacity-40 transition-opacity"
            aria-hidden="true"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple={false}
            accept=".txt,.md,.pdf,.json,.cpp,.h"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-label="Upload document file"
          />

          {/* Sinking Animation / Progress Ring */}
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-400 transition-all duration-300"
                    strokeDasharray={`${uploadProgress}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white">
                  {uploadProgress}%
                </div>
              </div>
              <div className="text-sm font-mono text-cyan-300 animate-pulse">
                Submerging & indexing "{sinkingFileName}"...
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all text-cyan-300">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold font-sans-clean text-white">
                Drag and drop files to submerge into index
              </h3>
              <p className="text-xs font-mono text-white/50 max-w-sm">
                Supports TXT, MD, PDF, JSON, C/C++ source code. Automatic term stemming & IDF calculation.
              </p>
              <button
                type="button"
                className="mt-2 px-5 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs uppercase tracking-wider hover:bg-white/90 shadow transition-all"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Inverted Index Document Table */}
        <div className="w-full rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-cyan-400" />
              <h3 className="text-sm font-bold font-sans-clean text-white">
                Indexed Corpus Registry
              </h3>
            </div>
            <span className="text-xs font-mono text-white/50">
              {indexedDocs.length} active documents
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-white/80">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-3.5">Document Title</th>
                  <th className="px-4 py-3.5">Terms</th>
                  <th className="px-4 py-3.5">Size</th>
                  <th className="px-4 py-3.5">Added Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans-clean">
                {indexedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white font-sans-clean">{doc.title}</div>
                      <div className="text-[11px] text-white/40 font-mono">ID: {doc.id}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-cyan-300">
                      {doc.termsCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-mono text-white/60">
                      {(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-4 font-mono text-white/50 text-[11px]">
                      {doc.addedAt}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 size={13} />
                        <span>Indexed</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete from index"
                        aria-label={`Delete ${doc.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
