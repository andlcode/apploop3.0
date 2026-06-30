
import { Howl, Howler } from 'howler';
import { getAudioPathsByRhythm } from './rhythmManager.js';
import { buildAudioPath } from './audioFileManager.js';
import { toast } from 'sonner';

class AudioManager {
  constructor() {
    this.cache = {}; // { [rhythmName]: { [type]: HowlInstance } }
    this.activeSounds = new Map(); // Maps type -> { sound, id }
    this.globalBpm = 120;
    this.baseBpm = 120; // Default base bpm to calculate stretch rate
    this.currentSequenceId = 0;
    this.returnTimeout = null; // Tracks scheduled returns
    this.masterSyncTime = 0; // Internal master clock for perfect measure synchronization
    
    Howler.volume(1.0);
  }

  // Generic loading function that handles all categories (Levada, Virada, Final, Prato)
  async loadAudio(rhythmName, audioType, providedPath = null) {
    if (!this.cache[rhythmName]) {
      this.cache[rhythmName] = {};
    }

    if (this.cache[rhythmName][audioType] && this.cache[rhythmName][audioType].state() === 'loaded') {
      return this.cache[rhythmName][audioType];
    }

    return new Promise(async (resolve) => {
      let source = providedPath;

      // Extract details to check in localStorage overrides based on rhythmName
      const [tipoRaw, numRaw] = audioType.split(' ');
      const tipoAudio = tipoRaw?.toLowerCase();
      const numeroAudio = numRaw ? `_${numRaw}` : '';
      
      const normRhythm = rhythmName ? rhythmName.toLowerCase().replace(/\s+/g, '-') : 'pop-rock-1';
      const customData = localStorage.getItem(`audio_${normRhythm}_${tipoAudio}${numeroAudio}_data`);

      if (customData) {
        source = customData;
      }

      if (!source) {
        const paths = getAudioPathsByRhythm(rhythmName);
        if (paths && paths[audioType]) {
          source = paths[audioType];
        } else {
          // Fallback using dynamic path builder
          let category = 'levadas';
          if (tipoAudio === 'virada') category = 'viradas';
          if (tipoAudio === 'final') category = 'finais';
          if (tipoAudio === 'prato') category = 'pratos';
          source = buildAudioPath(rhythmName, category, `${tipoAudio}${numRaw || ''}.mp3`);
        }
      }

      if (!source) {
        console.warn(`Áudio não encontrado para: ${audioType} no ritmo ${rhythmName}`);
        toast.error(`Áudio ${audioType} não encontrado`);
        resolve(null);
        return;
      }

      // Check existence for non-base64 standard urls
      if (source && !source.startsWith('data:')) {
        try {
          const res = await fetch(source, { method: 'HEAD' });
          if (!res.ok) {
            console.warn(`Áudio não encontrado: ${source}`);
            toast.error(`Áudio ${audioType} não encontrado (${rhythmName})`);
            resolve(null);
            return;
          }
        } catch (e) {
          console.warn(`Erro de rede ao verificar áudio: ${source}`, e);
          toast.error(`Falha ao verificar ${audioType} (${rhythmName})`);
          resolve(null);
          return;
        }
      }

      const sound = new Howl({
        src: [source],
        format: ['mp3', 'wav', 'ogg'],
        html5: false,
        preload: true,
        onload: () => {
          this.cache[rhythmName][audioType] = sound;
          resolve(sound);
        },
        onloaderror: () => {
          console.warn(`Erro ao carregar áudio: ${source}`);
          resolve(null);
        },
        onplayerror: () => {
          sound.once('unlock', () => {
            sound.play();
          });
        }
      });
    });
  }

  getSoundInstance(rhythmName, type) {
    return this.cache[rhythmName]?.[type];
  }

  agendarAudioComSincronismo(proximoAudioType, tipo, duracaoCompasso, callback) {
    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
    }

    const now = Date.now();
    const rate = this.globalBpm / this.baseBpm;
    const durMs = (duracaoCompasso * 1000) / rate;

    if (!this.masterSyncTime) {
      this.masterSyncTime = now;
    }

    while (this.masterSyncTime + 100 < now) {
      this.masterSyncTime += durMs;
    }

    const delayMs = Math.max(0, this.masterSyncTime - now);

    this.returnTimeout = setTimeout(() => {
      if (callback) callback();
    }, delayMs);
  }

  playAudio(rhythmName, type, options = {}) {
    const { loop = false, stopOthers = false } = options;
    this.currentSequenceId = Math.random();

    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }

    if (stopOthers) {
      this.stopAllAudios(true); 
    } else {
      this.stopAudioType(type);
      const mainLoopTypes = ['LEVADA 1', 'LEVADA 2', 'LEVADA 3', 'LEVADA 4', 'FINAL'];
      if (mainLoopTypes.includes(type)) {
        mainLoopTypes.forEach(t => this.stopAudioType(t));
      }
    }

    if (!this.masterSyncTime) {
      this.masterSyncTime = Date.now();
    }

    const rhythmCache = this.cache[rhythmName];
    if (!rhythmCache || !rhythmCache[type]) {
      return null;
    }

    const sound = rhythmCache[type];
    const rate = this.globalBpm / this.baseBpm;
    sound.rate(rate);
    sound.loop(loop);

    const instanceId = sound.play();
    this.activeSounds.set(type, { sound, id: instanceId });

    sound.once('end', () => {
      if (!loop && this.activeSounds.get(type)?.id === instanceId) {
        this.activeSounds.delete(type);
      }
    }, instanceId);

    return instanceId;
  }

  playVirada(rhythmName, viradaType, callbacks) {
    const seqId = Math.random();
    
    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }

    this.stopAllAudios(true); 
    this.currentSequenceId = seqId;

    if (!this.masterSyncTime) {
      this.masterSyncTime = Date.now();
    }

    const vSound = this.cache[rhythmName]?.[viradaType];
    if (!vSound) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    const rate = this.globalBpm / this.baseBpm;
    vSound.rate(rate);
    vSound.loop(false);
    
    const vId = vSound.play();
    this.activeSounds.set(viradaType, { sound: vSound, id: vId });

    if (callbacks?.onStart) callbacks.onStart(viradaType);

    vSound.once('end', () => {
      if (this.currentSequenceId !== seqId) return; 
      this.activeSounds.delete(viradaType);

      if (callbacks?.onEnd) callbacks.onEnd();
    }, vId);
  }

  stopAudioType(type) {
    if (this.activeSounds.has(type)) {
      const { sound, id } = this.activeSounds.get(type);
      sound.stop(id);
      this.activeSounds.delete(type);
    }
  }

  stopAllAudios(internal = false) {
    if (!internal) {
      this.currentSequenceId = Math.random();
      this.masterSyncTime = 0; 
    }
    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }
    Howler.stop();
    this.activeSounds.clear();
  }

  setVolume(volume) {
    Howler.volume(volume / 100);
  }

  setBPM(bpm) {
    this.globalBpm = bpm;
    const rate = bpm / this.baseBpm;
    this.activeSounds.forEach(({ sound, id }) => {
      sound.rate(rate, id);
    });
  }
}

export default new AudioManager();
