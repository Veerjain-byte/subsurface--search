# Subsurface — C++ Search Engine Frontend

> **"Search beneath the surface"**  
> An immersive, scroll-driven 3D web experience where the calm surface represents the search interface, and user queries or scrolling plunge the camera deep underwater into inverted postings, priority heaps, and memory-mapped indices.

---

## 1. Scroll Timeline & Camera Choreography

The camera position, focal target, underwater fog, and postprocessing distortion are continuously driven by scroll progress ($p \in [0.0, 1.0]$) synchronized via Lenis smooth scroll and GSAP ScrollTrigger.

| Scroll Range | Zone Name | Camera Position $(X, Y, Z)$ | Camera LookAt $(X, Y, Z)$ | Visual Atmosphere & Effects |
| :--- | :--- | :--- | :--- | :--- |
| **0.00 – 0.20** | **01 — The Surface (Hero)** | $(0.0, 2.8 \to 2.0, 9.5 \to 8.5)$ | $(0.0, 2.0, -4.0)$ | Warm sunset amber/vermilion sky, Torii gate, stone lantern with pulsing point light, floating emissive sphere, reflective water plane with layered GLSL ripples. |
| **0.20 – 0.40** | **02 — The Crossing / Descent** | $(0.0, 2.0 \to -9.0, 8.5 \to 7.0)$ | $(0.0, 2.0 \to -9.0, -3.0 \to 0.0)$ | **Transition Peak:** Camera plunges through water line ($Y=0$). Chromatic aberration (RGB split) spikes to maximum. Fog transitions from sunset dusk to dark ocean teal. |
| **0.40 – 0.70** | **03 — The Index / Results** | $(0.0, -9.0 \to -12.5, 7.0 \to 7.8)$ | $(0.0, -9.0 \to -12.5, 0.0)$ | Floating translucent 3D result cards bobbing gently in space. Swaying kelp columns, rising bubbles, query latency badge, accessible 2D toggle, document reader trigger. |
| **0.70 – 1.00** | **04 — The Floor / Under the Hood** | $(0.0, -12.5 \to -17.5, 7.8 \to 8.6)$ | $(0.0, -18.0 \to -21.8, -1.0)$ | Ocean floor ($Y=-22$). Procedural Voronoi caustic light shader. Hash table buckets as seabed stones (collision resolution mode switcher), Min-Heap bubble visualizer with step controls, Recharts benchmark analytics. |

---

## 2. Architecture & Directory Structure

```
src/
├── api/
│   └── client.ts            # Fetch client for C++ backend (:8080) with deterministic in-memory simulation
├── components/
│   └── ui/
│       ├── CustomCursor.tsx         # Follower ring with magnetic hover states
│       ├── DocumentReaderModal.tsx  # Accessible modal for full document inspection (ESC support)
│       ├── FixedChrome.tsx          # Wordmark, top nav, stats pill, settings dock
│       └── ToastNotification.tsx    # Live alert system for indexing and network events
├── config/
│   └── site.ts              # Single configuration file (Brand name, API URL, nav links, stats)
├── hooks/
│   └── useLenisScroll.ts    # Lenis smooth scroll synchronized with GSAP ScrollTrigger
├── scenes/
│   ├── FloatingResultCards3D.tsx    # 3D floating result cards in underwater zone
│   ├── HashTableStones3D.tsx        # Seabed stones representing hash table buckets & linked orbs
│   ├── HeapVisualizer3D.tsx         # 3D Min-Heap binary tree with glowing bubbles and links
│   ├── SurfaceScene.tsx             # Torii gate, stone steps, lantern, emissive sphere, water plane
│   ├── UnderwaterScene.tsx          # Drifting kelp, seabed rocks, rising bubble particles
│   └── World3D.tsx                  # Master Three.js Canvas, camera controller, postprocessing
├── sections/
│   ├── IndexSection.tsx             # Glowing portal dropzone, progress ring, document registry table
│   ├── ResultsSection.tsx           # Results HUD, latency metrics, did-you-mean, simple 2D view
│   ├── SurfaceHeroSection.tsx       # Mixed-font headline, glass search bar, autocomplete, filters
│   └── UnderTheHoodSection.tsx      # Research showcase, hash table modes, heap step-through, charts
├── shaders/
│   ├── causticShader.ts     # Procedural underwater floor caustic GLSL shader
│   └── waterShader.ts       # Layered sinusoidal wave vertex displacement + Fresnel reflection
├── store/
│   └── useSearchStore.ts    # Zustand state store (query, ranker, results, audio, theme, quality)
├── types/
│   └── index.ts             # TypeScript interfaces for search, documents, and benchmarks
└── utils/
    ├── audio.ts             # Procedural Web Audio API sound generator (Zero external files)
    ├── searchMath.ts        # Pure BM25, TF-IDF, hash collisions, and bounded min-heap algorithms
    └── searchMath.test.ts   # Unit tests verified via Node test runner (node:test)
```

---

## 3. Tech Stack & Key Choices

- **React 19 + Vite + TypeScript**: High performance, modern reactivity.
- **Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing**: Procedural 3D scene rendering, GLSL custom shaders, and chromatic aberration effects.
- **GSAP ScrollTrigger + Lenis**: Smooth, cinematic camera moves decoupled from raw wheel jumps.
- **Tailwind CSS v4**: Theme tokens, typography pairings, and frosted glass panels.
- **Zustand**: Fast, lightweight global state management.
- **Recharts**: Responsive SVG charts for latency, memory profile, and speedup benchmarks.
- **Web Audio API**: Procedural ambient drone, dive whoosh, and UI clicks with zero external audio assets.
- **Software WebGL Guard**: Automatically clamps DPR and falls back gracefully on headless or GPU-less environments.
