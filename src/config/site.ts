/**
 * Subsurface - Central Brand and Environment Configuration
 * Changeable in this single file as requested.
 */

export const SITE_CONFIG = {
  brandName: 'Subsurface',
  brandSuffix: 'search',
  taglineFirstLine: 'Search beneath',
  taglineSecondLine: 'the surface',
  eyebrow: 'A C++ DATA STRUCTURES SEARCH ENGINE',
  subtitle: 'A high-performance C++ index beneath a tranquil surface. Descend to navigate inverted lists, B-trees, and memory-mapped heaps in real time.',
  
  apiBaseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8080',
  
  navLinks: [
    { label: 'Search', href: '#surface', section: 'surface' },
    { label: 'Results', href: '#results', section: 'results' },
    { label: 'Under the Hood', href: '#under-the-hood', section: 'hood' },
    { label: 'Index', href: '#index', section: 'index' },
  ],
  
  scrollTimeline: {
    surface: { start: 0, end: 0.20, label: '01 — THE SURFACE' },
    dive: { start: 0.20, end: 0.40, label: '02 — THE DESCENT' },
    results: { start: 0.40, end: 0.70, label: '03 — THE INDEX' },
    floor: { start: 0.70, end: 1.00, label: '04 — THE OCEAN FLOOR' },
  },
  
  defaultStats: {
    docsCount: 12480,
    termsCount: 38240,
    avgLatencyMs: 14.2,
    indexSizeBytes: '48.6 MB',
  },
} as const;
