import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, BarChart3, Database, Cpu, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useSearchStore } from '../store/useSearchStore';
import { api } from '../api/client';
import type { HashTableMode, BenchmarkMetrics } from '../types';

export const UnderTheHoodSection: React.FC = () => {
  const hashTableMode = useSearchStore((s) => s.hashTableMode);
  const setHashTableMode = useSearchStore((s) => s.setHashTableMode);

  // Heap simulator state
  const [heapStep, setHeapStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heapNodes, setHeapNodes] = useState([
    { id: 1, val: 14, label: 'Doc #412 (BM25: 14)' },
    { id: 2, val: 28, label: 'Doc #89 (BM25: 28)' },
    { id: 3, val: 35, label: 'Doc #15 (BM25: 35)' },
    { id: 4, val: 42, label: 'Doc #703 (BM25: 42)' },
    { id: 5, val: 68, label: 'Doc #204 (BM25: 68)' },
    { id: 6, val: 82, label: 'Doc #55 (BM25: 82)' },
    { id: 7, val: 95, label: 'Doc #19 (BM25: 95)' },
  ]);

  // Benchmark metrics from api
  const [benchmarkData, setBenchmarkData] = useState<{
    hashMetrics: BenchmarkMetrics[];
    heapVsSort: Array<{ k: number; heapTimeUs: number; fullSortTimeUs: number; speedup: number }>;
    memoryProfile: Array<{ docs: string; memoryMb: number; rawMb: number }>;
  } | null>(null);

  useEffect(() => {
    api.getBenchmark().then((data) => setBenchmarkData(data));
  }, []);

  // Heap play loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHeapStep((prev) => (prev + 1) % 5);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stepForward = () => {
    setHeapStep((prev) => (prev + 1) % 5);
  };

  const resetHeap = () => {
    setHeapStep(0);
    setIsPlaying(false);
  };

  const heapOperations = [
    { text: 'Candidate Doc #999 arrives with BM25 score: 74', state: 'Comparing against Min-Heap root (score: 14)' },
    { text: 'Score 74 > Root 14: Evicting root Doc #412', state: 'Root overwritten with Doc #999' },
    { text: 'Sift-Down Step 1: Comparing with children Doc #89 & Doc #35', state: 'Smallest child is Doc #28' },
    { text: 'Swapping positions down branch to restore heap invariant', state: 'Swapped with Doc #28' },
    { text: 'Heap Invariant Restored: O(log K) amortized complexity', state: 'New top-K minimum root is Doc #28' },
  ];

  return (
    <section
      id="under-the-hood"
      className="relative min-h-[160vh] w-full flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-24 pb-24 z-10"
      aria-label="Under the Hood Research Showcase"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 shadow-sm">
          <Cpu size={13} className="text-cyan-400" />
          <span>03 — THE FLOOR / UNDER THE HOOD</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans-clean text-white tracking-tight mb-4 text-center">
          Data Structures Beneath the Abyss
        </h2>
        <p className="max-w-2xl text-sm sm:text-base text-white/70 font-sans-clean text-center mb-12">
          Interactive mechanical inspection of our low-latency C++ core: Robin Hood hash tables, cache-oblivious B-trees, and bounded min-heap priority queues.
        </p>

        {/* Grid of Interactive Visualizer Controls */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Panel 1: Hash Table Seabed Stone Visualizer */}
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                  <Database size={15} />
                  <span>Hash Table Collision Architecture</span>
                </div>
                <span className="text-[11px] font-mono text-white/50">Seabed Stones</span>
              </div>
              <h3 className="text-xl font-bold font-sans-clean text-white mb-2">
                Vocabulary Dictionary Index
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans-clean mb-6">
                Each seabed stone represents a bucket in memory. Linked orbs visualize collision chains. Watch the 3D seabed stones rearrange as you toggle collision resolution strategies.
              </p>

              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10 mb-6">
                {(['chaining', 'linear_probing', 'double_hashing'] as HashTableMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHashTableMode(mode)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      hashTableMode === mode
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Dynamic Strategy Spec Sheet */}
              <div className="p-4 rounded-xl bg-[#05161d] border border-cyan-500/20 text-xs font-mono text-cyan-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Selected Strategy:</span>
                  <span className="uppercase text-amber-300">{hashTableMode.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Worst-Case Probe Complexity:</span>
                  <span>{hashTableMode === 'chaining' ? 'O(L) Linked List' : 'O(N) Open Address'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Cache-Line Friendliness:</span>
                  <span>{hashTableMode === 'linear_probing' ? 'Optimal (Hardware Prefetch)' : 'Moderate'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Clustering Behavior:</span>
                  <span>{hashTableMode === 'double_hashing' ? 'No Secondary Clustering' : hashTableMode === 'linear_probing' ? 'Primary Clustering Risk' : 'None'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
              <span>View in 3D: Seabed Stones Floor</span>
              <span className="text-cyan-400">Y = -21.8</span>
            </div>
          </div>

          {/* Panel 2: Heap Top-K Visualizer Controls */}
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-amber-500/20 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                  <Layers size={15} />
                  <span>Bounded Min-Heap Top-K Queue</span>
                </div>
                <span className="text-[11px] font-mono text-white/50">O(N log K)</span>
              </div>
              <h3 className="text-xl font-bold font-sans-clean text-white mb-2">
                Real-Time Sift-Down Visualizer
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans-clean mb-6">
                Instead of sorting all candidate documents, the C++ engine maintains a bounded min-heap of capacity K=7. Scores lower than root are discarded in O(1).
              </p>

              {/* Play / Step / Reset Controls */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2.5 rounded-full font-mono text-xs flex items-center gap-2 transition-all shadow ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-white text-slate-950 font-semibold hover:bg-white/90'
                  }`}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause Simulation' : 'Auto Play'}</span>
                </button>
                <button
                  onClick={stepForward}
                  className="px-4 py-2.5 rounded-full glass-pill text-xs font-mono text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <SkipForward size={14} />
                  <span>Step</span>
                </button>
                <button
                  onClick={resetHeap}
                  className="p-2.5 rounded-full glass-pill text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset Heap State"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Step Commentary Box */}
              <div className="p-4 rounded-xl bg-[#1b1216] border border-amber-500/20 text-xs font-mono text-amber-200 space-y-1.5">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Step {heapStep + 1} of 5
                </div>
                <div className="font-semibold text-white">
                  {heapOperations[heapStep].text}
                </div>
                <div className="text-white/60">
                  {heapOperations[heapStep].state}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
              <span>View in 3D: Rising Bubble Tree</span>
              <span className="text-amber-400">Y = -17.5</span>
            </div>
          </div>
        </div>

        {/* Recharts Analytics Glass Panels */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Hash Lookup Time by Mode */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10 shadow-xl flex flex-col">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <BarChart3 size={14} />
              <span>Lookup Latency (μs)</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-4">Hash Collision Mode</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData?.hashMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 10 }} unit="μs" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b10', borderColor: '#26b5bb', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="lookupTimeUs" fill="#26b5bb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Heap Top-K vs Full Sort Speedup */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10 shadow-xl flex flex-col">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
              <Cpu size={14} />
              <span>Speedup Multiplier</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-4">Heap Top-K vs Full Sort</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkData?.heapVsSort || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="k" stroke="#ffffff50" tick={{ fontSize: 10 }} unit="k" />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 10 }} unit="x" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b10', borderColor: '#ffa459', borderRadius: 8, fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="speedup" stroke="#ffa459" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Memory Profile (Compressed vs Raw) */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10 shadow-xl flex flex-col">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <Database size={14} />
              <span>Memory Footprint</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-4">Compressed Inverted Index</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={benchmarkData?.memoryProfile || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="docs" stroke="#ffffff50" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 10 }} unit="MB" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b10', borderColor: '#34d399', borderRadius: 8, fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="memoryMb" stroke="#34d399" fill="#34d39933" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
