
export const RHYTHM_TYPES = [
  'LEVADA 1',
  'LEVADA 2',
  'LEVADA 3',
  'LEVADA 4',
  'VIRADA 1',
  'VIRADA 2',
  'VIRADA 3',
  'FINAL',
  'PRATO'
];

/**
 * Normalizes a string by converting to lowercase, removing accents, 
 * and removing separators (spaces, hyphens, underscores).
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[\s\-_]/g, ""); // Remove spaces, hyphens, underscores
};

/**
 * Recognizes the audio type from a filename based on flexible string matching.
 */
export const reconhecerArquivo = (nomeArquivo, nomeRitmo) => {
  const normArquivo = normalizeString(nomeArquivo);
  const normRitmo = normalizeString(nomeRitmo);

  for (const type of RHYTHM_TYPES) {
    const normType = normalizeString(type);
    if (normArquivo.includes(normType)) {
      return type;
    }
  }

  return null;
};

/**
 * Retrieves audio data URLs for a given rhythm.
 * Checks localStorage for overrides, otherwise constructs path based on rhythm folder structure.
 */
export const getAudioPathsByRhythm = (rhythmName) => {
  let customPaths = {};
  try {
    const savedRitmos = localStorage.getItem('apploop_ritmos');
    if (savedRitmos) {
      const ritmos = JSON.parse(savedRitmos);
      if (ritmos[rhythmName]) {
        customPaths = ritmos[rhythmName];
      }
    }
  } catch (e) {
    console.error('[rhythmManager] Failed to get audio paths from localStorage', e);
  }

  const normRhythm = rhythmName ? rhythmName.toLowerCase().replace(/\s+/g, '-') : 'pop-rock-1';
  
  // Note: Paths start with /audios/ assuming files are in /public/audios/
  const defaultPaths = {
    'LEVADA 1': `/audios/${normRhythm}/levadas/levada1.mp3`,
    'LEVADA 2': `/audios/${normRhythm}/levadas/levada2.mp3`,
    'LEVADA 3': `/audios/${normRhythm}/levadas/levada3.mp3`,
    'LEVADA 4': `/audios/${normRhythm}/levadas/levada4.mp3`,
    'VIRADA 1': `/audios/${normRhythm}/viradas/virada1.mp3`,
    'VIRADA 2': `/audios/${normRhythm}/viradas/virada2.mp3`,
    'VIRADA 3': `/audios/${normRhythm}/viradas/virada3.mp3`,
    'FINAL': `/audios/${normRhythm}/finais/final.mp3`,
    'PRATO': `/audios/${normRhythm}/pratos/prato.mp3`,
  };

  return { ...defaultPaths, ...customPaths };
};

/**
 * Calculates the duration of a bar (measure) in seconds.
 */
export const calcularDuracaoCompasso = (bpm, tempos = 4) => {
  if (!bpm || bpm <= 0) return 2; // Default fallback
  return (60 / bpm) * tempos;
};

/**
 * Calculates the remaining time in the current bar in seconds.
 */
export const calcularTempoRestante = (audioElement, duracaoCompasso) => {
  if (!audioElement || typeof audioElement.seek !== 'function') return 0;
  
  const currentTime = audioElement.seek() || 0;
  const pos = typeof currentTime === 'number' ? currentTime : 0;
  
  const positionInBar = pos % duracaoCompasso;
  return duracaoCompasso - positionInBar;
};

/**
 * Calculates the exact delay in milliseconds until the start of the next bar.
 */
export const calcularTempoEspera = (audioElement, duracaoCompasso, threshold = 0.1) => {
  const remaining = calcularTempoRestante(audioElement, duracaoCompasso);
  
  if (remaining < threshold) {
    return (remaining + duracaoCompasso) * 1000;
  }
  
  return remaining * 1000;
};

/**
 * Calculates the exact timestamp when the previous loop should resume after a fill.
 */
export const calculateReturnTimestamp = (startViradaAt, duracaoVirada, duracaoCompasso) => {
  const duracaoViradaMs = duracaoVirada * 1000;
  const duracaoCompassoMs = duracaoCompasso * 1000;
  
  const compassosOcupados = Math.ceil(duracaoViradaMs / duracaoCompassoMs);
  let timestampRetorno = startViradaAt + (compassosOcupados * duracaoCompassoMs);
  
  const posicaoNoCompasso = timestampRetorno % duracaoCompassoMs;
  if (posicaoNoCompasso !== 0) {
    timestampRetorno = timestampRetorno + (duracaoCompassoMs - posicaoNoCompasso);
  }
  
  return Math.round(timestampRetorno);
};

/**
 * Task 1: Maps rhythm transitions to the correct virada (turn).
 * Receives levadaAtual and levadaNova (can be numbers or strings like 'LEVADA 1')
 * Returns the corresponding virada number (1-3).
 */
export const identificarVirada = (levadaAtual, levadaNova) => {
  const getNum = (val) => typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val;
  
  const atual = getNum(levadaAtual);
  const nova = getNum(levadaNova);

  if (isNaN(atual) || isNaN(nova)) return null;

  // Subindo (ascending)
  if (atual === 1 && nova === 2) return 1;
  if (atual === 2 && nova === 3) return 2;
  if (atual === 2 && nova === 4) return 3;
  if (atual === 3 && nova === 4) return 3;

  // Descendo (descending)
  if (atual === 2 && nova === 1) return 1;
  if (atual === 3 && nova === 2) return 2;
  if (atual === 3 && nova === 1) return 2;
  if (atual === 4 && nova === 3) return 3;
  if (atual === 4 && nova === 2) return 3;
  if (atual === 4 && nova === 1) return 3;

  return null;
};
