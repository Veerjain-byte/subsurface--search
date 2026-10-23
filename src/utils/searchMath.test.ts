import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBM25, calculateTFIDF, simulateHashCollisions, BoundedMinHeap } from './searchMath';

test('BM25 scoring returns positive score on term frequency match', () => {
  const score = calculateBM25({
    tf: 3,
    docLength: 1200,
    avgDocLength: 1500,
    totalDocs: 10000,
    docsWithTerm: 50,
  });
  assert.ok(score > 0, 'BM25 score should be positive');
});

test('BM25 scoring returns 0 for zero term frequency', () => {
  const score = calculateBM25({
    tf: 0,
    docLength: 1200,
    avgDocLength: 1500,
    totalDocs: 10000,
    docsWithTerm: 50,
  });
  assert.equal(score, 0);
});

test('TF-IDF returns higher score for rarer terms', () => {
  const commonTermScore = calculateTFIDF(2, 1000, 500);
  const rareTermScore = calculateTFIDF(2, 1000, 5);
  assert.ok(rareTermScore > commonTermScore, 'Rarer terms must yield higher TF-IDF score');
});

test('simulateHashCollisions accurately counts chaining and probing collisions', () => {
  const keys = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
  const resChaining = simulateHashCollisions(keys, 5, 'chaining');
  assert.equal(resChaining.buckets.length, 5);
  assert.ok(resChaining.totalCollisions >= 0);

  const resProbing = simulateHashCollisions(keys, 10, 'linear_probing');
  assert.equal(resProbing.buckets.length, 10);
  assert.ok(resProbing.maxProbes >= 1);
});

test('BoundedMinHeap retains only the top K elements by score', () => {
  const heap = new BoundedMinHeap<{ id: string; score: number }>(3);

  heap.insert({ id: 'a', score: 10 });
  heap.insert({ id: 'b', score: 50 });
  heap.insert({ id: 'c', score: 30 });
  assert.equal(heap.size(), 3);
  assert.equal(heap.peekMin()?.score, 10);

  // Inserting lower score should be rejected
  const rejected = heap.insert({ id: 'd', score: 5 });
  assert.equal(rejected, false);
  assert.equal(heap.size(), 3);

  // Inserting higher score replaces min root (10)
  const accepted = heap.insert({ id: 'e', score: 40 });
  assert.equal(accepted, true);
  assert.equal(heap.size(), 3);
  // Root should now be 30 (minimum among 50, 30, 40)
  assert.equal(heap.peekMin()?.score, 30);
});
