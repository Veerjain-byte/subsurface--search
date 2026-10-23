import React, { useEffect } from 'react';
import { useLenisScroll } from './hooks/useLenisScroll';
import { World3D } from './scenes/World3D';
import { FixedChrome } from './components/ui/FixedChrome';
import { CustomCursor } from './components/ui/CustomCursor';
import { ToastProvider } from './components/ui/ToastNotification';
import { SurfaceHeroSection } from './sections/SurfaceHeroSection';
import { ResultsSection } from './sections/ResultsSection';
import { UnderTheHoodSection } from './sections/UnderTheHoodSection';
import { IndexSection } from './sections/IndexSection';
import { DocumentReaderModal } from './components/ui/DocumentReaderModal';
import { useSearchStore } from './store/useSearchStore';
import { proceduralAudio } from './utils/audio';

export default function App() {
  const { scrollTo } = useLenisScroll();
  const scrollProgress = useSearchStore((s) => s.scrollProgress);
  const audioEnabled = useSearchStore((s) => s.audioEnabled);
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const performSearch = useSearchStore((s) => s.performSearch);

  // Sync audio depth filter with scroll progress
  useEffect(() => {
    proceduralAudio.setEnabled(audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    proceduralAudio.updateUnderwaterDepth(scrollProgress);
  }, [scrollProgress]);

  // Initial seed search on first mount so the index is pre-populated
  useEffect(() => {
    if (!hasSearched) {
      performSearch('simd inverted index');
    }
  }, [hasSearched, performSearch]);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      scrollTo(el);
    }
  };

  return (
    <ToastProvider>
      <div className="relative min-h-screen w-full bg-[#070b10] text-[#f4ede4] selection:bg-[#ff7b47] selection:text-white">
        {/* Custom cursor (disabled on touch devices) */}
        <CustomCursor />

        {/* Master 3D WebGL Canvas (fixed in background, camera animated by scroll) */}
        <World3D />

        {/* Fixed UI Chrome (Wordmark, Nav, Stats, Settings Dock) */}
        <FixedChrome onNavigate={handleNavigate} />

        {/* Main Scroll Content Overlay */}
        <main className="relative z-10 flex flex-col w-full">
          {/* Section 01: The Surface (Hero) */}
          <SurfaceHeroSection />

          {/* Section 02: The Crossing / Results */}
          <ResultsSection />

          {/* Section 03: The Floor / Under the Hood */}
          <UnderTheHoodSection />

          {/* Section 04: Index Management */}
          <IndexSection />
        </main>

        {/* Accessible Document Reader Panel Modal */}
        <DocumentReaderModal />
      </div>
    </ToastProvider>
  );
}
