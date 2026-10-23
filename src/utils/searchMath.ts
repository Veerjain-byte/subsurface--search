/**
 * Pure mathematical algorithms for C++ search engine simulation:
 * - BM25 Okapi scoring
 * - TF-IDF cosine similarity approximation
 * - Hash collision simulation for Chaining, Linear Probing, Double Hashing
 * - Min-Heap top-K invariant verification
 */

export interface BM25Params {
  tf: number;
  docLength: number;
  avgDocLength: number;
  totalDocs: number;
  docsWithTerm: number;
  k1?: number;
  b?: number;
}

export function calculateBM25({
  tf,
  docLength,
  avgDocLength,
  totalDocs,
  docsWithTerm,
  k1 = 1.2,
  b = 0.75,
}: BM25Params): number {
  if (tf <= 0) return 0;
  // IDF with floor smoothing
  const idf = Math.log((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
  const lengthNorm = 1 - b + b * (docLength / Math.max(1, avgDocLength));
  const tfComponent = (tf * (k1 + 1)) / (tf + k1 * lengthNorm);
  return Math.max(0, idf * tfComponent);
}

export function calculateTFIDF(tf: number, totalDocs: number, docsWithTerm: number): number {
  if (tf <= 0) return 0;
  const termFrequency = Math.sqrt(tf);
  const idf = Math.log(1 + totalDocs / Math.max(1, docsWithTerm));
  return termFrequency * idf;
}

export function simulateHashCollisions(
  keys: string[],
  bucketCount: number,
  mode: 'chaining' | 'linear_probing' | 'double_hashing'
): {
  buckets: Array<{ index: number; keys: string[]; probes: number }>;
  totalCollisions: number;
  maxProbes: number;
} {
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    index: i,
    keys: [] as string[],
    probes: 0,
  }));

  // Hash function (djb2 hash variant)
  const hash1 = (str: string) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % bucketCount;
  };

  // Secondary hash for double hashing
  const hash2 = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
    }
    return 1 + (Math.abs(hash) % (bucketCount - 1));
  };

  let totalCollisions = 0;
  let maxProbes = 0;

  for (const key of keys) {
    const h1 = hash1(key);

    if (mode === 'chaining') {
      if (buckets[h1].keys.length > 0) {
        totalCollisions++;
      }
      buckets[h1].keys.push(key);
      buckets[h1].probes = Math.max(buckets[h1].probes, buckets[h1].keys.length);
      maxProbes = Math.max(maxProbes, buckets[h1].keys.length);
    } else if (mode === 'linear_probing') {
      let probe = 0;
      let slot = h1;
      while (buckets[slot].keys.length > 0 && probe < bucketCount) {
        totalCollisions++;
        probe++;
        slot = (h1 + probe) % bucketCount;
      }
      buckets[slot].keys.push(key);
      buckets[slot].probes = probe + 1;
      maxProbes = Math.max(maxProbes, probe + 1);
    } else {
      // Double hashing
      const step = hash2(key);
      let probe = 0;
      let slot = h1;
      while (buckets[slot].keys.length > 0 && probe < bucketCount) {
        totalCollisions++;
        probe++;
        slot = (h1 + probe * step) % bucketCount;
      }
      buckets[slot].keys.push(key);
      buckets[slot].probes = probe + 1;
      maxProbes = Math.max(maxProbes, probe + 1);
    }
  }

  return { buckets, totalCollisions, maxProbes };
}

export class BoundedMinHeap<T extends { score: number }> {
  private heap: T[] = [];
  constructor(public readonly capacity: number) {}

  insert(item: T): boolean {
    if (this.heap.length < this.capacity) {
      this.heap.push(item);
      this.siftUp(this.heap.length - 1);
      return true;
    }

    if (item.score > this.heap[0].score) {
      this.heap[0] = item;
      this.siftDown(0);
      return true;
    }

    return false;
  }

  getValues(): T[] {
    return [...this.heap];
  }

  peekMin(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  private siftUp(index: number) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].score < this.heap[parent].score) {
        const temp = this.heap[current];
        this.heap[current] = this.heap[parent];
        this.heap[parent] = temp;
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let smallest = current;
      const left = 2 * current + 1;
      const right = 2 * current + 2;

      if (left < length && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < length && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }

      if (smallest !== current) {
        const temp = this.heap[current];
        this.heap[current] = this.heap[smallest];
        this.heap[smallest] = temp;
        current = smallest;
      } else {
        break;
      }
    }
  }
}
