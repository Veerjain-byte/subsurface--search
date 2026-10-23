import { create } from 'zustand';
import type { SearchResult, RankerType, SearchMode, QualityPreset, ThemePreset, IndexDoc, HashTableMode } from '../types';
import { api } from '../api/client';

const THEME_TARGETS: Record<ThemePreset, number> = {
  night: 0.04,
  dawn: 0.25,
  noon: 0.50,
  golden: 0.70,
  dusk: 0.78,
};

const getInitialTimeOfDay = (): { time: number; theme: ThemePreset; follow: boolean } => {
  if (typeof window === 'undefined') {
    return { time: 0.78, theme: 'dusk', follow: false };
  }
  const follow = localStorage.getItem('subsurface_follow_local') === 'true';
  if (follow) {
    const now = new Date();
    const t = (now.getHours() + now.getMinutes() / 60) / 24;
    return { time: t, theme: 'golden', follow: true };
  }
  const saved = localStorage.getItem('subsurface_tod');
  const time = saved ? parseFloat(saved) : 0.78;
  const savedTheme = (localStorage.getItem('subsurface_theme') as ThemePreset) || 'dusk';
  return { time, theme: savedTheme, follow: false };
};

const initialTimeData = getInitialTimeOfDay();

interface SearchState {
  query: string;
  activeRanker: RankerType;
  activeMode: SearchMode;
  results: SearchResult[];
  latencyMs: number;
  isSearching: boolean;
  didYouMean?: string;
  hasSearched: boolean;
  
  // Navigation & Scroll
  scrollProgress: number;
  activeSection: string;
  isDiving: boolean;
  
  // Settings & Time of Day
  audioEnabled: boolean;
  quality: QualityPreset;
  theme: ThemePreset;
  timeOfDay: number;
  targetTimeOfDay: number;
  followLocalTime: boolean;
  simpleView: boolean;
  
  // Modals & Panels
  activeDocReader: SearchResult | null;
  
  // Index management
  indexedDocs: IndexDoc[];
  
  // Visualizers
  hashTableMode: HashTableMode;
  
  // Actions
  setQuery: (query: string) => void;
  setRanker: (ranker: RankerType) => void;
  setMode: (mode: SearchMode) => void;
  performSearch: (queryOverride?: string) => Promise<void>;
  setScrollProgress: (progress: number) => void;
  setActiveSection: (section: string) => void;
  triggerDive: (toSection?: string) => void;
  toggleAudio: () => void;
  setQuality: (quality: QualityPreset) => void;
  setTheme: (theme: ThemePreset) => void;
  setTimeOfDay: (time: number) => void;
  setTargetTimeOfDay: (time: number) => void;
  setFollowLocalTime: (follow: boolean) => void;
  toggleSimpleView: () => void;
  openDocReader: (doc: SearchResult) => void;
  closeDocReader: () => void;
  addIndexedDoc: (doc: IndexDoc) => void;
  removeIndexedDoc: (id: string) => void;
  setHashTableMode: (mode: HashTableMode) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  activeRanker: 'bm25',
  activeMode: 'free',
  results: [],
  latencyMs: 14,
  isSearching: false,
  didYouMean: undefined,
  hasSearched: false,
  
  scrollProgress: 0,
  activeSection: 'surface',
  isDiving: false,
  
  audioEnabled: false,
  quality: 'high',
  theme: initialTimeData.theme,
  timeOfDay: initialTimeData.time,
  targetTimeOfDay: initialTimeData.time,
  followLocalTime: initialTimeData.follow,
  simpleView: false,
  
  activeDocReader: null,
  
  indexedDocs: [
    {
      id: 'doc-01',
      title: 'Inverted Index Postings Compression & SIMD Intersections',
      sizeBytes: 1048576 * 4.2,
      termsCount: 9240,
      addedAt: '2026-10-20 14:32',
      status: 'indexed',
      snippetPreview: 'Vectorized bit-packing and Elias-Fano encoding for integer posting lists.',
    },
    {
      id: 'doc-02',
      title: 'Cache-Oblivious B-Tree Implementation in Modern C++',
      sizeBytes: 1048576 * 2.8,
      termsCount: 6180,
      addedAt: '2026-10-21 09:15',
      status: 'indexed',
      snippetPreview: 'Van Emde Boas recursive memory layout for sub-microsecond dictionary queries.',
    },
    {
      id: 'doc-03',
      title: 'BM25 Okapi with Dynamic Document Normalization',
      sizeBytes: 1048576 * 1.6,
      termsCount: 4320,
      addedAt: '2026-10-21 16:45',
      status: 'indexed',
      snippetPreview: 'IDF scaling and saturation dampening in streaming search pipelines.',
    },
    {
      id: 'doc-04',
      title: 'Bounded Min-Heap Top-K Document Queue',
      sizeBytes: 1048576 * 0.95,
      termsCount: 2890,
      addedAt: '2026-10-22 08:10',
      status: 'indexed',
      snippetPreview: 'O(log K) insertion with branchless sift-down swaps.',
    },
  ],
  
  hashTableMode: 'chaining',
  
  setQuery: (query) => set({ query }),
  setRanker: (activeRanker) => set({ activeRanker }),
  setMode: (activeMode) => set({ activeMode }),
  
  performSearch: async (queryOverride) => {
    const q = queryOverride !== undefined ? queryOverride : get().query;
    set({ isSearching: true, query: q });
    
    try {
      const response = await api.search(q, get().activeRanker, get().activeMode);
      set({
        results: response.results,
        latencyMs: response.latencyMs,
        didYouMean: response.didYouMean,
        isSearching: false,
        hasSearched: true,
      });
    } catch {
      set({ isSearching: false });
    }
  },
  
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  
  triggerDive: (toSection = 'results') => {
    set({ isDiving: true });
    setTimeout(() => {
      set({ isDiving: false });
    }, 1500);

    const targetEl = document.getElementById(toSection);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
  setQuality: (quality) => set({ quality }),
  
  setTheme: (theme) => {
    const target = THEME_TARGETS[theme] ?? 0.78;
    try {
      localStorage.setItem('subsurface_theme', theme);
      localStorage.setItem('subsurface_tod', target.toString());
      localStorage.setItem('subsurface_follow_local', 'false');
    } catch {
      // safe fallback
    }
    set({ theme, targetTimeOfDay: target, followLocalTime: false });
  },

  setTimeOfDay: (timeOfDay) => {
    set({ timeOfDay });
    try {
      localStorage.setItem('subsurface_tod', timeOfDay.toString());
    } catch {
      // safe fallback
    }
  },

  setTargetTimeOfDay: (targetTimeOfDay) => {
    try {
      localStorage.setItem('subsurface_tod', targetTimeOfDay.toString());
      localStorage.setItem('subsurface_follow_local', 'false');
    } catch {
      // safe fallback
    }
    set({ targetTimeOfDay, followLocalTime: false });
  },

  setFollowLocalTime: (followLocalTime) => {
    try {
      localStorage.setItem('subsurface_follow_local', followLocalTime ? 'true' : 'false');
    } catch {
      // safe fallback
    }
    if (followLocalTime) {
      const now = new Date();
      const t = (now.getHours() + now.getMinutes() / 60) / 24;
      set({ followLocalTime: true, targetTimeOfDay: t });
    } else {
      set({ followLocalTime: false });
    }
  },
  
  toggleSimpleView: () => set((s) => ({ simpleView: !s.simpleView })),
  
  openDocReader: (doc) => set({ activeDocReader: doc }),
  closeDocReader: () => set({ activeDocReader: null }),
  
  addIndexedDoc: (doc) => set((s) => ({ indexedDocs: [doc, ...s.indexedDocs] })),
  removeIndexedDoc: (id) => set((s) => ({ indexedDocs: s.indexedDocs.filter((d) => d.id !== id) })),
  
  setHashTableMode: (hashTableMode) => set({ hashTableMode }),
}));
