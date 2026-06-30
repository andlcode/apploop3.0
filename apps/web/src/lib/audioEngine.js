
import * as Tone from 'tone';

class Loop {
  constructor(id, name, category, color, createPattern) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.color = color;
    this.duration = '4m';
    this.isPlaying = false;
    this.volume = null;
    this.createPattern = createPattern;
    this.synths = null;
    this.part = null;
  }

  initialize() {
    try {
      // Lazy initialization of Web Audio nodes
      if (!this.volume) {
        this.volume = new Tone.Volume(-Infinity).toDestination();
      }
      
      const { synths, pattern } = this.createPattern();
      this.synths = synths;
      
      this.synths.forEach(synth => {
        synth.connect(this.volume);
      });

      this.part = new Tone.Part((time, note) => {
        try {
          if (note && note.synth && note.note) {
            // Guarantee time is never null/undefined to prevent Tone.js crashes
            const t = time !== null && time !== undefined ? time : Tone.now();
            note.synth.triggerAttackRelease(note.note, note.duration || '8n', t, note.velocity || 1);
          }
        } catch (e) {
          console.warn(`Synth trigger error in loop ${this.name}:`, e);
        }
      }, pattern);
      
      this.part.loop = true;
      this.part.loopEnd = '4m';
    } catch (e) {
      console.error(`Failed to initialize loop ${this.name}:`, e);
    }
  }

  start(time) {
    try {
      if (!this.part) this.initialize();
      
      if (this.part) {
        const t = time !== null && time !== undefined ? time : Tone.now();
        this.part.start(t);
        
        if (this.volume && this.volume.volume) {
          // Cancel any existing fades to avoid conflicts, then ramp up
          this.volume.volume.cancelScheduledValues(t);
          this.volume.volume.rampTo(0, 0.5, t);
        }
        this.isPlaying = true;
      }
    } catch (e) {
      console.error(`Failed to start loop ${this.name}:`, e);
    }
  }

  stop(time) {
    try {
      if (this.part && this.volume && this.volume.volume) {
        const t = time !== null && time !== undefined ? time : Tone.now();
        
        // Cancel existing ramps and fade out
        this.volume.volume.cancelScheduledValues(t);
        this.volume.volume.rampTo(-Infinity, 0.5, t);
        
        // Fully stop the part after the crossfade completes
        setTimeout(() => {
          try {
            if (this.part && !this.isPlaying) {
               this.part.stop(Tone.now());
            }
          } catch (e) {}
        }, 500);
      }
      this.isPlaying = false;
    } catch (e) {
      console.error(`Failed to stop loop ${this.name}:`, e);
    }
  }

  dispose() {
    try {
      if (this.part) {
        this.part.dispose();
        this.part = null;
      }
      if (this.synths) {
        this.synths.forEach(synth => synth.dispose());
        this.synths = null;
      }
      if (this.volume) {
        this.volume.dispose();
        this.volume = null;
      }
    } catch (e) {
      console.error("Error disposing loop:", e);
    }
  }
}

class AudioEngine {
  constructor() {
    this.loops = new Map();
    this.currentLoop = null;
    this.isInitialized = false;
    this.isTrackingSetup = false;
    this.measureCallbacks = [];
    this.beatCallbacks = [];
    this.currentMeasure = 0;
    this.currentBeat = 0;
  }

  getLoopDefinitions() {
    return [
      {
        id: 'ritmo-1',
        name: 'MPB',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1 } });
          const hihat = new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '0:1:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:1:2', synth: snare, note: 'C2', duration: '8n' },
            { time: '0:2:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:3:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '0:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '1:1:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:1:2', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:2:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:3:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '1:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '2:1:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:1:2', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:2:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:3:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '2:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '3:1:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:1:2', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:2:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:3:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '3:3:2', synth: hihat, note: 'C4', duration: '16n' },
          ];
          
          return { synths: [kick, snare, hihat], pattern };
        }
      },
      {
        id: 'ritmo-2',
        name: 'Pop Lento',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 6 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.15 } });
          const hihat = new Tone.MetalSynth({ frequency: 180, envelope: { attack: 0.001, decay: 0.08 }, harmonicity: 4.5 });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '0:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '1:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:3:0', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '2:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '3:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:3:0', synth: hihat, note: 'C4', duration: '16n' },
          ];
          
          return { synths: [kick, snare, hihat], pattern };
        }
      },
      {
        id: 'ritmo-3',
        name: 'Rock',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.03, octaves: 8 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2 } });
          const hihat = new Tone.MetalSynth({ frequency: 220, envelope: { attack: 0.001, decay: 0.05 } });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '0:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '0:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:2:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '0:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '0:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '1:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:2:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '1:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '2:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:2:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '2:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:3:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '3:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:2:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '3:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:3:2', synth: hihat, note: 'C4', duration: '16n' },
          ];
          
          return { synths: [kick, snare, hihat], pattern };
        }
      },
      {
        id: 'virada-1',
        name: 'Virada 1',
        category: 'virada',
        color: 'purple',
        createPattern: () => {
          const tom1 = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 3 });
          const tom2 = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 2.5 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.15 } });
          
          const pattern = [
            { time: '0:0:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '0:1:0', synth: tom2, note: 'E2', duration: '8n' },
            { time: '0:2:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '0:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:0:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '1:1:0', synth: tom2, note: 'E2', duration: '8n' },
            { time: '1:2:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '1:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:0:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '2:1:0', synth: tom2, note: 'E2', duration: '8n' },
            { time: '2:2:0', synth: tom1, note: 'G2', duration: '8n' },
            { time: '2:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:0:0', synth: tom1, note: 'G2', duration: '16n' },
            { time: '3:0:2', synth: tom2, note: 'E2', duration: '16n' },
            { time: '3:1:0', synth: tom1, note: 'G2', duration: '16n' },
            { time: '3:1:2', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:2:0', synth: tom1, note: 'G2', duration: '16n' },
            { time: '3:2:2', synth: tom2, note: 'E2', duration: '16n' },
            { time: '3:3:0', synth: snare, note: 'C2', duration: '8n' },
          ];
          
          return { synths: [tom1, tom2, snare], pattern };
        }
      },
      {
        id: 'virada-2',
        name: 'Virada 2',
        category: 'virada',
        color: 'purple',
        createPattern: () => {
          const tom = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 4 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.2 } });
          
          const pattern = [
            { time: '0:0:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '0:0:2', synth: tom, note: 'F2', duration: '16n' },
            { time: '0:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '0:1:2', synth: tom, note: 'D2', duration: '16n' },
            { time: '0:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '0:3:0', synth: tom, note: 'F2', duration: '8n' },
            { time: '1:0:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '1:0:2', synth: tom, note: 'F2', duration: '16n' },
            { time: '1:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '1:1:2', synth: tom, note: 'D2', duration: '16n' },
            { time: '1:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:3:0', synth: tom, note: 'F2', duration: '8n' },
            { time: '2:0:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '2:0:2', synth: tom, note: 'F2', duration: '16n' },
            { time: '2:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '2:1:2', synth: tom, note: 'D2', duration: '16n' },
            { time: '2:2:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:3:0', synth: tom, note: 'F2', duration: '8n' },
            { time: '3:0:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:0:2', synth: tom, note: 'F2', duration: '16n' },
            { time: '3:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:1:2', synth: tom, note: 'D2', duration: '16n' },
            { time: '3:2:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:2:2', synth: tom, note: 'F2', duration: '16n' },
            { time: '3:3:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:3:2', synth: tom, note: 'D2', duration: '16n' },
          ];
          
          return { synths: [tom, snare], pattern };
        }
      },
      {
        id: 'virada-3',
        name: 'Virada 3',
        category: 'virada',
        color: 'purple',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.18 } });
          const tom = new Tone.MembraneSynth({ pitchDecay: 0.06, octaves: 3.5 });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '0:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '0:2:0', synth: tom, note: 'G2', duration: '8n' },
            { time: '0:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '1:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '1:2:0', synth: tom, note: 'G2', duration: '8n' },
            { time: '1:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '8n' },
            { time: '2:1:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '2:2:0', synth: tom, note: 'G2', duration: '8n' },
            { time: '2:3:0', synth: snare, note: 'C2', duration: '8n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '3:0:2', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:1:0', synth: tom, note: 'G2', duration: '16n' },
            { time: '3:1:2', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:2:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '3:2:2', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:3:0', synth: tom, note: 'G2', duration: '16n' },
            { time: '3:3:2', synth: snare, note: 'C2', duration: '16n' },
          ];
          
          return { synths: [kick, snare, tom], pattern };
        }
      },
      {
        id: 'intro',
        name: 'Intro',
        category: 'intro',
        color: 'cyan',
        createPattern: () => {
          const synth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 } });
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 5 });
          
          const pattern = [
            { time: '0:0:0', synth: synth, note: 'C4', duration: '2n' },
            { time: '0:2:0', synth: synth, note: 'E4', duration: '2n' },
            { time: '1:0:0', synth: synth, note: 'G4', duration: '2n' },
            { time: '1:2:0', synth: synth, note: 'C5', duration: '2n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '2:2:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '3:2:0', synth: kick, note: 'C1', duration: '4n' },
          ];
          
          return { synths: [synth, kick], pattern };
        }
      },
      {
        id: 'final',
        name: 'Final',
        category: 'final',
        color: 'cyan',
        createPattern: () => {
          const synth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 1 } });
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 6 });
          const cymbal = new Tone.MetalSynth({ frequency: 250, envelope: { attack: 0.001, decay: 1.5, release: 2 } });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '0:2:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '1:2:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '2:0:0', synth: synth, note: 'C5', duration: '1n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '3:0:0', synth: cymbal, note: 'C4', duration: '1n' },
          ];
          
          return { synths: [synth, kick, cymbal], pattern };
        }
      },
      {
        id: 'prato',
        name: 'Prato',
        category: 'prato',
        color: 'magenta',
        createPattern: () => {
          const cymbal = new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.5, release: 1 }, harmonicity: 5.5, modulationIndex: 40 });
          
          const pattern = [
            { time: '0:0:0', synth: cymbal, note: 'C4', duration: '2n' },
            { time: '1:0:0', synth: cymbal, note: 'C4', duration: '2n' },
            { time: '2:0:0', synth: cymbal, note: 'C4', duration: '2n' },
            { time: '3:0:0', synth: cymbal, note: 'C4', duration: '2n' },
          ];
          
          return { synths: [cymbal], pattern };
        }
      },
      {
        id: 'samba',
        name: 'Samba',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const surdo = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2 });
          const tamborim = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05 } });
          const agogo = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.1 } });
          
          const pattern = [
            { time: '0:0:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '0:0:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '0:1:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '0:1:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '0:2:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '0:2:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '0:3:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '0:3:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '1:0:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '1:0:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '1:1:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '1:1:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '1:2:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '1:2:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '1:3:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '1:3:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '2:0:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '2:0:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '2:1:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '2:1:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '2:2:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '2:2:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '2:3:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '2:3:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '3:0:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '3:0:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '3:1:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '3:1:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '3:2:0', synth: surdo, note: 'G1', duration: '8n' },
            { time: '3:2:2', synth: tamborim, note: 'C2', duration: '16n' },
            { time: '3:3:0', synth: agogo, note: 'C4', duration: '16n' },
            { time: '3:3:2', synth: tamborim, note: 'C2', duration: '16n' },
          ];
          
          return { synths: [surdo, tamborim, agogo], pattern };
        }
      },
      {
        id: 'funk',
        name: 'Funk',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 10 });
          const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15 } });
          const hihat = new Tone.MetalSynth({ frequency: 250, envelope: { attack: 0.001, decay: 0.03 } });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '0:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '0:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:2:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '0:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '0:3:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '0:3:2', synth: kick, note: 'C1', duration: '16n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '1:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '1:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:2:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '1:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '1:3:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '1:3:2', synth: kick, note: 'C1', duration: '16n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '2:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '2:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:2:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '2:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '2:3:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '2:3:2', synth: kick, note: 'C1', duration: '16n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '3:0:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:1:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:1:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:2:0', synth: kick, note: 'C1', duration: '16n' },
            { time: '3:2:2', synth: hihat, note: 'C4', duration: '16n' },
            { time: '3:3:0', synth: snare, note: 'C2', duration: '16n' },
            { time: '3:3:2', synth: kick, note: 'C1', duration: '16n' },
          ];
          
          return { synths: [kick, snare, hihat], pattern };
        }
      },
      {
        id: 'bossa',
        name: 'Bossa Nova',
        category: 'ritmo',
        color: 'cyan',
        createPattern: () => {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.06, octaves: 4 });
          const rim = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05 } });
          const brush = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.2 } });
          
          const pattern = [
            { time: '0:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '0:1:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '0:2:0', synth: brush, note: 'C2', duration: '8n' },
            { time: '0:3:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '1:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '1:1:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '1:2:0', synth: brush, note: 'C2', duration: '8n' },
            { time: '1:3:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '2:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '2:1:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '2:2:0', synth: brush, note: 'C2', duration: '8n' },
            { time: '2:3:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '3:0:0', synth: kick, note: 'C1', duration: '4n' },
            { time: '3:1:0', synth: rim, note: 'C2', duration: '8n' },
            { time: '3:2:0', synth: brush, note: 'C2', duration: '8n' },
            { time: '3:3:0', synth: rim, note: 'C2', duration: '8n' },
          ];
          
          return { synths: [kick, rim, brush], pattern };
        }
      }
    ];
  }

  initializeLoops() {
    try {
      const loopDefinitions = this.getLoopDefinitions();
      loopDefinitions.forEach(def => {
        const loop = new Loop(def.id, def.name, def.category, def.color, def.createPattern);
        this.loops.set(def.id, loop);
      });
    } catch (e) {
      console.error("Failed to map loop definitions:", e);
    }
  }

  async initializeAudio() {
    if (this.isInitialized && Tone.context.state === 'running') return;
    
    try {
      // Must be called upon user interaction
      await Tone.start();
      
      // Initialize Transport state securely
      if (Tone.Transport) {
        Tone.Transport.bpm.value = 175;
        Tone.Transport.timeSignature = [4, 4];
      }
      
      if (this.loops.size === 0) {
        this.initializeLoops();
      }
      
      this.setupMeasureTracking();
      this.isInitialized = true;
    } catch (e) {
      console.error("Error initializing Tone.js audio engine:", e);
    }
  }

  setupMeasureTracking() {
    if (this.isTrackingSetup) return;
    this.isTrackingSetup = true;

    try {
      Tone.Transport.scheduleRepeat((time) => {
        try {
          const position = Tone.Transport.position;
          if (typeof position === 'string') {
            const parts = position.split(':');
            const measure = parseInt(parts[0]) || 0;
            const beat = parseInt(parts[1]) || 0;
            
            this.currentMeasure = measure % 4;
            this.currentBeat = beat;
            
            this.measureCallbacks.forEach(cb => cb(this.currentMeasure));
            this.beatCallbacks.forEach(cb => cb(this.currentBeat));
          }
        } catch (e) {
          console.warn("Measure tracking parsing error:", e);
        }
      }, '16n');
    } catch (e) {
      console.error("Failed to setup measure tracking schedule:", e);
    }
  }

  async playLoop(loopId) {
    try {
      await this.initializeAudio();
      
      const loop = this.loops.get(loopId);
      if (!loop) return;

      if (this.currentLoop && this.currentLoop.id !== loopId) {
        this.currentLoop.stop(Tone.now());
      }

      this.currentLoop = loop;
      loop.start(Tone.now());
      
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start(Tone.now());
      }
    } catch (e) {
      console.error(`Failed to play loop ${loopId}:`, e);
    }
  }

  stopLoop() {
    try {
      if (this.currentLoop) {
        this.currentLoop.stop(Tone.now());
        this.currentLoop = null;
      }
      if (Tone.Transport.state === 'started') {
        // Delay full transport stop to let crossfades finish
        setTimeout(() => {
          try {
            if (!this.currentLoop) {
               Tone.Transport.stop(Tone.now());
            }
          } catch (e) {}
        }, 550);
      }
    } catch (e) {
      console.error("Failed to stop current loop:", e);
    }
  }

  async switchLoopAtMeasure(newLoopId) {
    try {
      await this.initializeAudio();
      
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start(Tone.now());
      }

      // Schedule at the start of the next measure relative to the Transport
      const nextMeasureTime = Tone.Transport.nextSubdivision('1m');
      
      Tone.Transport.scheduleOnce((time) => {
        try {
          if (this.currentLoop) {
            this.currentLoop.stop(time);
          }
          
          const newLoop = this.loops.get(newLoopId);
          if (newLoop) {
            this.currentLoop = newLoop;
            // Use the perfectly synchronized `time` generated by scheduleOnce
            newLoop.start(time);
          }
        } catch (e) {
          console.warn("Failed switching loop in schedule block:", e);
        }
      }, nextMeasureTime);
    } catch (e) {
      console.error(`Failed to schedule switch to loop ${newLoopId}:`, e);
    }
  }

  async playFill(fillId) {
    await this.switchLoopAtMeasure(fillId);
  }

  async playIntro() {
    await this.playLoop('intro');
  }

  async playOutro() {
    await this.switchLoopAtMeasure('final');
  }

  async playOneShot(shotId) {
    try {
      await this.initializeAudio();
      
      const loop = this.loops.get(shotId);
      if (!loop) return;

      if (!loop.part) loop.initialize();
      
      const now = Tone.now();
      
      // Override any fades and ensure full volume
      if (loop.volume && loop.volume.volume) {
        loop.volume.volume.cancelScheduledValues(now);
        loop.volume.volume.setValueAtTime(0, now);
      }
      
      loop.part.start(now);
      
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start(now);
      }
      
      // Stop exactly 4 measures later
      setTimeout(() => {
        try {
          if (loop.part && !loop.isPlaying) {
             loop.part.stop(Tone.now());
          }
        } catch (e) {}
      }, Tone.Time('4m').toSeconds() * 1000);
    } catch (e) {
      console.error(`Failed to play one shot ${shotId}:`, e);
    }
  }

  setBPM(bpm) {
    try {
      if (this.isInitialized && Tone.Transport) {
        Tone.Transport.bpm.rampTo(bpm, 0.5, Tone.now());
      }
    } catch (e) {
      console.error(`Failed to set BPM to ${bpm}:`, e);
    }
  }

  setVolume(volume) {
    try {
      const dbValue = volume <= 0 ? -Infinity : Tone.gainToDb(volume / 100);
      if (Tone.Destination && Tone.Destination.volume) {
        Tone.Destination.volume.rampTo(dbValue, 0.1, Tone.now());
      }
    } catch (e) {
      console.error(`Failed to set Volume to ${volume}:`, e);
    }
  }

  getCurrentMeasure() {
    return this.currentMeasure;
  }

  getCurrentBeat() {
    return this.currentBeat;
  }

  getIsPlaying() {
    try {
      return Tone.Transport.state === 'started';
    } catch (e) {
      return false;
    }
  }

  onMeasureChange(callback) {
    this.measureCallbacks.push(callback);
  }

  onBeatChange(callback) {
    this.beatCallbacks.push(callback);
  }

  getLoops() {
    // If not yet initialized, return the definitions early so the UI can render
    if (this.loops.size === 0) {
      return this.getLoopDefinitions().map(def => ({
        id: def.id,
        name: def.name,
        category: def.category,
        color: def.color,
        isPlaying: false
      }));
    }
    
    return Array.from(this.loops.values()).map(loop => ({
      id: loop.id,
      name: loop.name,
      category: loop.category,
      color: loop.color,
      isPlaying: loop.isPlaying
    }));
  }

  dispose() {
    try {
      this.loops.forEach(loop => loop.dispose());
      this.loops.clear();
      
      if (Tone.Transport) {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
    } catch (e) {
      console.error("Failed to dispose AudioEngine:", e);
    }
  }
}

export default new AudioEngine();
