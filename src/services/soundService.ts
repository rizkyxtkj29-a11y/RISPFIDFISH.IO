// ============================================================================
// RISPFID FISH - Joyful & Cozy Aquatic Audio Engine
// ============================================================================
// - Lively, cheerful, and relaxing simulation music (Animal Crossing & Cozy Grove vibes)
// - Bouncy acoustic upright bass + cheerful marimba/kalimba melody + warm Rhodes chords
// - Soft background trickling water ambiance (suara air alami)
// - High-precision Web Audio lookahead sequencer (zero lag, zero drift)
// ============================================================================

interface MelodyNote {
  step: number;
  freq: number;
  durationSteps: number;
}

interface BassNote {
  step: number;
  freq: number;
  durationSteps: number;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private volume: number = 0.7; // Default 70% volume

  // Master, Music & Water Ambiance Buses
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private waterGain: GainNode | null = null;

  // Continuous Water Stream Ambiance
  private waterNoiseSource: AudioBufferSourceNode | null = null;

  // Sequencer Settings (104 BPM, 16th-note steps, 16 bars = 256 steps)
  private readonly bpm: number = 104;
  private readonly stepsPerBar: number = 16;
  private readonly totalSteps: number = 256;
  private stepDuration: number = 0; // Calculated in seconds
  private scheduleAheadTime: number = 0.12; // 120ms lookahead
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private schedulerTimerId: number | null = null;

  // Music Sequence Data
  private melodyNotes: MelodyNote[] = [];
  private bassNotes: BassNote[] = [];
  private chordProgression: number[][] = []; // 16 bars

  constructor() {
    const savedMute = localStorage.getItem('rispfid_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
    const savedVol = localStorage.getItem('rispfid_volume');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        this.volume = parsed;
      }
    }
    this.stepDuration = 60 / this.bpm / 4; // 16th note in seconds
    this.initComposition();
  }

  /**
   * Initializes the 16-bar cheerful, heartwarming melody, bouncy bass, and chords
   */
  private initComposition(): void {
    // Note frequencies in Hz
    const C2 = 65.41, D2 = 73.42, E2 = 82.41, F2 = 87.31, G2 = 98.00, A2 = 110.00, B2 = 123.47;
    const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
    const Csharp3 = 138.59, Csharp4 = 277.18;

    // 16 Bars Chord Harmonies (Warm Rhodes/Piano)
    this.chordProgression = [
      [C3, G3, B3, E4],      // Bar 0: Cmaj7
      [D3, A3, C4, F4],      // Bar 1: Dm7
      [E3, B3, D4, G4],      // Bar 2: Em7
      [F3, C4, E4, A4],      // Bar 3: Fmaj7
      [C3, G3, B3, E4],      // Bar 4: Cmaj7
      [A2, E3, G3, C4],      // Bar 5: Am7
      [D3, A3, C4, F4],      // Bar 6: Dm7 -> G7
      [C3, G3, A3, E4],      // Bar 7: C6/9
      [F3, C4, E4, A4],      // Bar 8: Fmaj7
      [E3, B3, D4, G4],      // Bar 9: Em7
      [D3, A3, C4, F4],      // Bar 10: Dm7
      [G2, D3, F3, B3],      // Bar 11: G7
      [E3, B3, D4, G4],      // Bar 12: Em7 -> A7
      [D3, A3, C4, F4],      // Bar 13: Dm7
      [G2, D3, F3, B3],      // Bar 14: G7
      [C3, G3, B3, E4]       // Bar 15: Cmaj7 Turnaround
    ];

    // Cheerful, Playful Mallet/Marimba Melody
    this.melodyNotes = [
      // Bar 0 (Cmaj7) - Joyful start
      { step: 0, freq: G4, durationSteps: 4 },
      { step: 4, freq: E4, durationSteps: 2 },
      { step: 6, freq: G4, durationSteps: 2 },
      { step: 8, freq: C5, durationSteps: 3 },
      { step: 11, freq: B4, durationSteps: 2 },
      { step: 13, freq: A4, durationSteps: 3 },

      // Bar 1 (Dm7) - Playful sway
      { step: 16, freq: F4, durationSteps: 4 },
      { step: 20, freq: D4, durationSteps: 2 },
      { step: 22, freq: F4, durationSteps: 2 },
      { step: 24, freq: A4, durationSteps: 3 },
      { step: 27, freq: G4, durationSteps: 2 },
      { step: 29, freq: F4, durationSteps: 3 },

      // Bar 2 (Em7) - Uplifting climb
      { step: 32, freq: G4, durationSteps: 3 },
      { step: 35, freq: B4, durationSteps: 2 },
      { step: 37, freq: D5, durationSteps: 3 },
      { step: 40, freq: E5, durationSteps: 4 },
      { step: 44, freq: D5, durationSteps: 4 },

      // Bar 3 (Fmaj7) - Sweet cascade
      { step: 48, freq: C5, durationSteps: 5 },
      { step: 53, freq: A4, durationSteps: 3 },
      { step: 56, freq: G4, durationSteps: 4 },
      { step: 60, freq: E4, durationSteps: 4 },

      // Bar 4 (Cmaj7) - Heartwarming theme reprise
      { step: 64, freq: G4, durationSteps: 3 },
      { step: 67, freq: C5, durationSteps: 2 },
      { step: 69, freq: D5, durationSteps: 3 },
      { step: 72, freq: E5, durationSteps: 4 },
      { step: 76, freq: G5, durationSteps: 4 },

      // Bar 5 (Am7) - Cozy step down
      { step: 80, freq: E5, durationSteps: 3 },
      { step: 83, freq: D5, durationSteps: 2 },
      { step: 85, freq: C5, durationSteps: 3 },
      { step: 88, freq: A4, durationSteps: 4 },
      { step: 92, freq: C5, durationSteps: 4 },

      // Bar 6 (Dm7 -> G7) - Catchy swing
      { step: 96, freq: D5, durationSteps: 3 },
      { step: 99, freq: C5, durationSteps: 2 },
      { step: 101, freq: B4, durationSteps: 3 },
      { step: 104, freq: G4, durationSteps: 2 },
      { step: 106, freq: A4, durationSteps: 2 },
      { step: 108, freq: B4, durationSteps: 4 },

      // Bar 7 (C6/9) - Pleasant cadence & flourish
      { step: 112, freq: C5, durationSteps: 7 },
      { step: 120, freq: G4, durationSteps: 2 },
      { step: 122, freq: A4, durationSteps: 2 },
      { step: 124, freq: B4, durationSteps: 2 },
      { step: 126, freq: C5, durationSteps: 2 },

      // Bar 8 (Fmaj7) - Section B: Breezy outdoor atmosphere
      { step: 128, freq: A4, durationSteps: 3 },
      { step: 131, freq: C5, durationSteps: 2 },
      { step: 133, freq: E5, durationSteps: 3 },
      { step: 136, freq: D5, durationSteps: 4 },
      { step: 140, freq: C5, durationSteps: 4 },

      // Bar 9 (Em7)
      { step: 144, freq: G4, durationSteps: 3 },
      { step: 147, freq: B4, durationSteps: 2 },
      { step: 149, freq: D5, durationSteps: 3 },
      { step: 152, freq: C5, durationSteps: 4 },
      { step: 156, freq: B4, durationSteps: 4 },

      // Bar 10 (Dm7)
      { step: 160, freq: F4, durationSteps: 3 },
      { step: 163, freq: A4, durationSteps: 2 },
      { step: 165, freq: C5, durationSteps: 3 },
      { step: 168, freq: B4, durationSteps: 4 },
      { step: 172, freq: A4, durationSteps: 4 },

      // Bar 11 (G7) - Lively run
      { step: 176, freq: G4, durationSteps: 3 },
      { step: 179, freq: B4, durationSteps: 2 },
      { step: 181, freq: D5, durationSteps: 3 },
      { step: 184, freq: F5, durationSteps: 3 },
      { step: 187, freq: E5, durationSteps: 2 },
      { step: 189, freq: D5, durationSteps: 3 },

      // Bar 12 (Em7 -> A7) - Spark of wonder
      { step: 192, freq: E5, durationSteps: 4 },
      { step: 196, freq: G5, durationSteps: 3 },
      { step: 199, freq: E5, durationSteps: 3 },
      { step: 202, freq: Csharp4 * 2, durationSteps: 3 },
      { step: 205, freq: A4, durationSteps: 3 },

      // Bar 13 (Dm7)
      { step: 208, freq: D5, durationSteps: 3 },
      { step: 211, freq: F5, durationSteps: 2 },
      { step: 213, freq: E5, durationSteps: 3 },
      { step: 216, freq: D5, durationSteps: 4 },
      { step: 220, freq: C5, durationSteps: 4 },

      // Bar 14 (G7) - Playful resolution setup
      { step: 224, freq: B4, durationSteps: 3 },
      { step: 227, freq: D5, durationSteps: 2 },
      { step: 229, freq: E5, durationSteps: 3 },
      { step: 232, freq: D5, durationSteps: 2 },
      { step: 234, freq: C5, durationSteps: 2 },
      { step: 236, freq: B4, durationSteps: 4 },

      // Bar 15 (Cmaj7) - Warm return home
      { step: 240, freq: C5, durationSteps: 9 },
      { step: 250, freq: E4, durationSteps: 3 },
      { step: 253, freq: G4, durationSteps: 3 }
    ];

    // Bouncy Upright Acoustic Bass (Roots, Fifths, Walking Octaves)
    this.bassNotes = [
      // Bar 0 (C)
      { step: 0, freq: C2, durationSteps: 4 },
      { step: 4, freq: G2, durationSteps: 4 },
      { step: 8, freq: C3, durationSteps: 4 },
      { step: 12, freq: G2, durationSteps: 4 },

      // Bar 1 (Dm)
      { step: 16, freq: D2, durationSteps: 4 },
      { step: 20, freq: A2, durationSteps: 4 },
      { step: 24, freq: D3, durationSteps: 4 },
      { step: 28, freq: A2, durationSteps: 4 },

      // Bar 2 (Em)
      { step: 32, freq: E2, durationSteps: 4 },
      { step: 36, freq: B2, durationSteps: 4 },
      { step: 40, freq: E3, durationSteps: 4 },
      { step: 44, freq: B2, durationSteps: 4 },

      // Bar 3 (F)
      { step: 48, freq: F2, durationSteps: 4 },
      { step: 52, freq: C3, durationSteps: 4 },
      { step: 56, freq: F3, durationSteps: 4 },
      { step: 60, freq: C3, durationSteps: 4 },

      // Bar 4 (C)
      { step: 64, freq: C2, durationSteps: 4 },
      { step: 68, freq: G2, durationSteps: 4 },
      { step: 72, freq: C3, durationSteps: 4 },
      { step: 76, freq: G2, durationSteps: 4 },

      // Bar 5 (Am)
      { step: 80, freq: A2 * 0.5, durationSteps: 4 },
      { step: 84, freq: E2, durationSteps: 4 },
      { step: 88, freq: A2, durationSteps: 4 },
      { step: 92, freq: E2, durationSteps: 4 },

      // Bar 6 (Dm -> G)
      { step: 96, freq: D2, durationSteps: 4 },
      { step: 100, freq: A2, durationSteps: 4 },
      { step: 104, freq: G2, durationSteps: 4 },
      { step: 108, freq: D3, durationSteps: 4 },

      // Bar 7 (C)
      { step: 112, freq: C2, durationSteps: 4 },
      { step: 116, freq: G2, durationSteps: 4 },
      { step: 120, freq: C3, durationSteps: 4 },
      { step: 124, freq: G2, durationSteps: 4 },

      // Bar 8 (F)
      { step: 128, freq: F2, durationSteps: 4 },
      { step: 132, freq: C3, durationSteps: 4 },
      { step: 136, freq: F3, durationSteps: 4 },
      { step: 140, freq: C3, durationSteps: 4 },

      // Bar 9 (Em)
      { step: 144, freq: E2, durationSteps: 4 },
      { step: 148, freq: B2, durationSteps: 4 },
      { step: 152, freq: E3, durationSteps: 4 },
      { step: 156, freq: B2, durationSteps: 4 },

      // Bar 10 (Dm)
      { step: 160, freq: D2, durationSteps: 4 },
      { step: 164, freq: A2, durationSteps: 4 },
      { step: 168, freq: D3, durationSteps: 4 },
      { step: 172, freq: A2, durationSteps: 4 },

      // Bar 11 (G)
      { step: 176, freq: G2, durationSteps: 4 },
      { step: 180, freq: D3, durationSteps: 4 },
      { step: 184, freq: G3, durationSteps: 4 },
      { step: 188, freq: F2, durationSteps: 4 },

      // Bar 12 (Em -> A)
      { step: 192, freq: E2, durationSteps: 4 },
      { step: 196, freq: B2, durationSteps: 4 },
      { step: 200, freq: A2, durationSteps: 4 },
      { step: 204, freq: Csharp3, durationSteps: 4 },

      // Bar 13 (Dm)
      { step: 208, freq: D2, durationSteps: 4 },
      { step: 212, freq: A2, durationSteps: 4 },
      { step: 216, freq: D3, durationSteps: 4 },
      { step: 220, freq: A2, durationSteps: 4 },

      // Bar 14 (G)
      { step: 224, freq: G2, durationSteps: 4 },
      { step: 228, freq: B2, durationSteps: 4 },
      { step: 232, freq: D3, durationSteps: 4 },
      { step: 236, freq: G2, durationSteps: 4 },

      // Bar 15 (C)
      { step: 240, freq: C2, durationSteps: 4 },
      { step: 244, freq: G2, durationSteps: 4 },
      { step: 248, freq: C3, durationSteps: 4 },
      { step: 252, freq: G2, durationSteps: 4 }
    ];
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('rispfid_volume', String(this.volume));

    if (!this.ctx) {
      this.initCtx();
    }

    if (this.ctx && this.musicGain) {
      const effectiveMusicGain = this.isMuted ? 0 : this.volume * 0.75;
      this.musicGain.gain.setTargetAtTime(effectiveMusicGain, this.ctx.currentTime, 0.05);
    }

    if (this.ctx && this.waterGain) {
      const effectiveWaterGain = this.isMuted ? 0 : this.volume * 0.08;
      this.waterGain.gain.setTargetAtTime(effectiveWaterGain, this.ctx.currentTime, 0.05);
    }

    // Auto unmute if user adjusts volume upward while muted
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
      localStorage.setItem('rispfid_muted', 'false');
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.05);
      }
    }

    if (!this.isPlaying && this.volume > 0 && !this.isMuted) {
      this.startAmbient();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('rispfid_muted', String(this.isMuted));

    if (!this.ctx) {
      this.initCtx();
    }

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 1;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (this.musicGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume * 0.75;
      this.musicGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (this.waterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume * 0.08;
      this.waterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (!this.isMuted && !this.isPlaying) {
      this.startAmbient();
    }

    return this.isMuted;
  }

  /**
   * Starts peaceful water stream + joyful, cozy simulation soundtrack
   */
  public startAmbient(): void {
    if (this.isPlaying) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      this.isPlaying = true;

      // 1. Natural Aquarium Water Ambiance (Soft trickling stream)
      this.setupGentleWater(ctx, this.masterGain);

      // 2. Joyful & Relaxing Simulation Music Bus
      this.musicGain = ctx.createGain();
      const initialGain = this.isMuted ? 0 : this.volume * 0.75;
      this.musicGain.gain.setValueAtTime(initialGain, ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // 3. Start High-Precision Sequencer
      this.currentStep = 0;
      this.nextStepTime = ctx.currentTime + 0.1;
      this.runScheduler();
    } catch (e) {
      console.warn('Gagal memulai audio santai:', e);
    }
  }

  /**
   * Precise lookahead scheduler that guarantees solid tempo & sync
   */
  private runScheduler(): void {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.stepDuration;
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }

    this.schedulerTimerId = window.setTimeout(() => this.runScheduler(), 25);
  }

  /**
   * Schedules all musical events occurring on the given step
   */
  private scheduleStep(step: number, time: number): void {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    // A. Check Melody notes starting on this step
    const melody = this.melodyNotes.find((m) => m.step === step);
    if (melody) {
      const durationSec = melody.durationSteps * this.stepDuration;
      this.playMarimbaTone(melody.freq, time, durationSec);
    }

    // B. Check Bass notes starting on this step
    const bass = this.bassNotes.find((b) => b.step === step);
    if (bass) {
      const durationSec = bass.durationSteps * this.stepDuration;
      this.playAcousticBassTone(bass.freq, time, durationSec);
    }

    // C. Soft Rhodes / Piano Chords on Offbeats (Steps 4 and 12 of each 16-step bar)
    const stepInBar = step % this.stepsPerBar;
    const barIndex = Math.floor(step / this.stepsPerBar);
    if (stepInBar === 4 || stepInBar === 12) {
      const chord = this.chordProgression[barIndex];
      if (chord) {
        this.playWarmChordStrum(chord, time, this.stepDuration * 3.5);
      }
    }

    // D. Subtle Cozy Percussion
    // Soft wooden kick on beat 1 and 3 (step 0 and 8 of each bar)
    if (stepInBar === 0 || stepInBar === 8) {
      this.playSoftKick(time);
    }
    // Very gentle brush / shaker tap on 8th notes (steps 2, 4, 6, 8, 10, 12, 14)
    if (stepInBar % 2 === 0) {
      this.playSoftShaker(time, stepInBar === 4 || stepInBar === 12);
    }
  }

  /**
   * Playful Marimba / Kalimba Mallet Tone (Cheerful, warm & clear)
   */
  private playMarimbaTone(freq: number, time: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const oscPrimary = this.ctx.createOscillator();
      const oscWoodMallet = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm sine fundamental + soft triangle harmonic for wooden acoustic body
      oscPrimary.type = 'sine';
      oscPrimary.frequency.setValueAtTime(freq, time);

      oscWoodMallet.type = 'triangle';
      oscWoodMallet.frequency.setValueAtTime(freq * 3, time); // 3rd overtone for authentic mallet snap

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, time);

      // Mallet envelope: Instant crisp attack, gentle percussive acoustic ring
      const vol = 0.26;
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(vol, time + 0.006);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.45));

      oscPrimary.connect(noteGain);
      oscWoodMallet.connect(noteGain);
      noteGain.connect(filter);
      filter.connect(this.musicGain);

      const stopTime = time + Math.min(duration, 0.46);
      oscPrimary.start(time);
      oscWoodMallet.start(time);
      oscPrimary.stop(stopTime);
      oscWoodMallet.stop(stopTime);
    } catch {}
  }

  /**
   * Bouncy Acoustic Upright Bass (Provides the cozy, joyful groove)
   */
  private playAcousticBassTone(freq: number, time: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const oscSine = this.ctx.createOscillator();
      const oscTri = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      oscSine.type = 'sine';
      oscSine.frequency.setValueAtTime(freq, time);

      oscTri.type = 'triangle';
      oscTri.frequency.setValueAtTime(freq, time);

      // Lowpass to keep bass deep, punchy and warm without rumble
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, time);

      const vol = 0.30;
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(vol, time + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration, 0.48));

      oscSine.connect(noteGain);
      oscTri.connect(noteGain);
      noteGain.connect(filter);
      filter.connect(this.musicGain);

      const stopTime = time + Math.min(duration, 0.5);
      oscSine.start(time);
      oscTri.start(time);
      oscSine.stop(stopTime);
      oscTri.stop(stopTime);
    } catch {}
  }

  /**
   * Warm Rhodes / Electric Piano Chords (Smooth harmonic support)
   */
  private playWarmChordStrum(frequencies: number[], time: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      frequencies.forEach((freq, i) => {
        if (!this.ctx || !this.musicGain) return;
        const noteTime = time + i * 0.012; // Slight natural strum delay
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, noteTime);

        const vol = 0.12;
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.linearRampToValueAtTime(vol, noteTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

        osc.connect(noteGain);
        noteGain.connect(filter);
        filter.connect(this.musicGain);

        osc.start(noteTime);
        osc.stop(noteTime + duration + 0.02);
      });
    } catch {}
  }

  /**
   * Soft Wooden Kick Thud (Rhythmic anchor, non-intrusive)
   */
  private playSoftKick(time: number): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.07);

      gain.gain.setValueAtTime(0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.085);
    } catch {}
  }

  /**
   * Gentle Shaker / Brush Tap (Gives a cozy acoustic swing)
   */
  private playSoftShaker(time: number, isAccent: boolean): void {
    if (!this.ctx || !this.musicGain) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(5200, time);
      bandpass.Q.setValueAtTime(2.0, time);

      const gain = this.ctx.createGain();
      const vol = isAccent ? 0.07 : 0.04;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.024);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.026);
    } catch {}
  }

  /**
   * Very soft, organic aquarium water flow (pink noise + slow gentle LFO)
   */
  private setupGentleWater(ctx: AudioContext, destination: GainNode): void {
    try {
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5) * 0.06;
      }

      this.waterNoiseSource = ctx.createBufferSource();
      this.waterNoiseSource.buffer = noiseBuffer;
      this.waterNoiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(550, ctx.currentTime);

      const gentleBand = ctx.createBiquadFilter();
      gentleBand.type = 'bandpass';
      gentleBand.frequency.setValueAtTime(380, ctx.currentTime);
      gentleBand.Q.setValueAtTime(1.2, ctx.currentTime);

      const flowLfo = ctx.createOscillator();
      flowLfo.type = 'sine';
      flowLfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(80, ctx.currentTime);
      flowLfo.connect(lfoGain);
      lfoGain.connect(gentleBand.frequency);
      flowLfo.start();

      this.waterGain = ctx.createGain();
      const initialWaterGain = this.isMuted ? 0 : this.volume * 0.08;
      this.waterGain.gain.setValueAtTime(initialWaterGain, ctx.currentTime);

      this.waterNoiseSource.connect(lowpass);
      lowpass.connect(gentleBand);
      gentleBand.connect(this.waterGain);
      this.waterGain.connect(destination);

      this.waterNoiseSource.start();
    } catch {}
  }

  // ============================================================================
  // INTERACTIVE GAME SFX (Crisp & Pleasant)
  // ============================================================================

  /**
   * Interactive single bubble pop (when fish grabs food or swims to surface)
   */
  public playBubble(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 520 + Math.random() * 220;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Feeding water splash
   */
  public playFeedSplash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);

      setTimeout(() => this.playBubble(), 50);
    } catch {}
  }

  /**
   * Coin transaction chime
   */
  public playCoin(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.08, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch {}
  }

  /**
   * Water cleaning effect
   */
  public playWaterClean(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(550, now + 0.3);
      osc.frequency.linearRampToValueAtTime(380, now + 0.6);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.66);
    } catch {}
  }

  /**
   * Level up / Milestone achievement fanfare
   */
  public playLevelUp(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.52);
      });
    } catch {}
  }

  public stopAmbient(): void {
    this.isPlaying = false;
    if (this.schedulerTimerId) {
      clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    if (this.waterNoiseSource) {
      try {
        this.waterNoiseSource.stop();
        this.waterNoiseSource.disconnect();
      } catch {}
      this.waterNoiseSource = null;
    }
  }
}

export const sound = new SoundService();

