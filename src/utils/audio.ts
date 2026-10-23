/**
 * Procedural Web Audio API sound generator
 * Zero external audio files or network dependencies.
 */

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled = false;
  private ambientGain: GainNode | null = null;
  private underwaterFilter: BiquadFilterNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.isEnabled) return;
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.underwaterFilter = this.ctx.createBiquadFilter();
      this.underwaterFilter.type = 'lowpass';
      this.underwaterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(65.4, this.ctx.currentTime); // C2 drone

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(98.0, this.ctx.currentTime); // G2 fifth

      this.osc1.connect(this.underwaterFilter);
      this.osc2.connect(this.underwaterFilter);
      this.underwaterFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
    } catch {
      // Audio autoplay policy guard
    }
  }

  private stopAmbient() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
    } catch {
      // safe cleanup
    }
    this.osc1 = null;
    this.osc2 = null;
  }

  playDiveSound() {
    if (!this.ctx || !this.isEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 1.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    } catch {
      // safe fallback
    }
  }

  playClickSound() {
    if (!this.ctx || !this.isEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // safe fallback
    }
  }

  updateUnderwaterDepth(progress: number) {
    if (!this.ctx || !this.underwaterFilter || !this.isEnabled) return;
    try {
      // Lower frequency cutoff as depth increases (450Hz at surface -> 120Hz at ocean floor)
      const targetFreq = 450 - progress * 330;
      this.underwaterFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch {
      // safe fallback
    }
  }
}

export const proceduralAudio = new ProceduralAudioEngine();
