export type RankerType = 'bm25' | 'tfidf';
export type SearchMode = 'free' | 'boolean' | 'phrase';
export type QualityPreset = 'high' | 'medium' | 'low';
export type ThemePreset = 'dawn' | 'noon' | 'golden' | 'dusk' | 'night';

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  url?: string;
  tags: string[];
  docLength: number;
  termFrequency?: Record<string, number>;
  highlights: string[];
}

export interface Suggestion {
  text: string;
  category?: string;
  frequency?: number;
}

export interface IndexDoc {
  id: string;
  title: string;
  sizeBytes: number;
  termsCount: number;
  addedAt: string;
  status: 'indexed' | 'indexing' | 'error';
  snippetPreview?: string;
}

export interface SearchResponse {
  query: string;
  ranker: RankerType;
  mode: SearchMode;
  results: SearchResult[];
  totalResults: number;
  latencyMs: number;
  didYouMean?: string;
}

export type HashTableMode = 'chaining' | 'linear_probing' | 'double_hashing';

export interface HashBucket {
  index: number;
  keys: string[];
  isCollision: boolean;
  probes: number;
}

export interface HeapNode {
  id: number;
  value: number;
  label: string;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted';
}

export interface BenchmarkMetrics {
  name: string;
  lookupTimeUs: number;
  memoryMb: number;
  collisions: number;
}
