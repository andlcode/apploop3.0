import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import audioManager from '@/lib/audioManager.js';
import { calcularDuracaoCompasso, identificarVirada } from '@/lib/rhythmManager.js';
import { toast } from 'sonner';

const LoopManagerContext = createContext(null);

export const LoopManagerProvider = ({ children }) => {
  const [ritmos, setRitmos] = useState({ 'pop-rock-1': {} });
  
  // Rhythm Name State
  const [rhythmName, setRhythmNameState] = useState('pop-rock-1');
  
  const [audioStates, setAudioStates] = useState({});

  // Legacy Playback State
  const [activeTypes, setActiveTypes] = useState(new Set());
  const [currentVolume, setCurrentVolume] = useState(100);
  const [levada1Used, setLevada1Used] = useState(false);

  // Sync State
  const [bpm, setBpmState] = useState(120);
  const [currentAudio, setCurrentAudioState] = useState(null); 
  const [nextAudio, setNextAudioState] = useState(null); 
  const [audioStartTime, setAudioStartTimeState] = useState(0);
  const [isScheduled, setIsScheduledState] = useState(false);

  // Symmetric return state tracking
  const [previousLoop, setPreviousLoopState] = useState(null);

  const barDuration = useMemo(() => calcularDuracaoCompasso(bpm), [bpm]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedRitmos = localStorage.getItem('apploop_ritmos');
      const savedSelected = localStorage.getItem('apploop_selectedRitmo');
      const savedStates = localStorage.getItem('apploop_audioStates');

      if (savedRitmos) {
        setRitmos({ 'pop-rock-1': {}, ...JSON.parse(savedRitmos) });
      }

      if (savedSelected) {
        setRhythmNameState(savedSelected);
      }

      if (savedStates) {
        setAudioStates(JSON.parse(savedStates));
      }
    } catch (e) {
      console.error('Failed to load from local storage', e);
    }
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
    return () => {
      audioManager.stopAllAudios();
    };
  }, [loadFromLocalStorage]);

  const saveToLocalStorage = useCallback((newRitmos, newSelected, newStates) => {
    try {
      if (newRitmos) localStorage.setItem('apploop_ritmos', JSON.stringify(newRitmos));
      if (newSelected) localStorage.setItem('apploop_selectedRitmo', newSelected);
      if (newStates) localStorage.setItem('apploop_audioStates', JSON.stringify(newStates));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        toast.error('Armazenamento local cheio. Os áudios novos funcionarão apenas nesta sessão.');
      }
    }
  }, []);

  // Context Functions
  const setRhythmName = useCallback((newRhythmName) => {
    if (!newRhythmName) return;
    
    setRhythmNameState(newRhythmName);
    
    // Switch rhythm: Stop current audio, reset states 
    audioManager.stopAllAudios();
    setActiveTypes(new Set());
    setCurrentAudioState(null);
    setNextAudioState(null);
    setIsScheduledState(false);
    setLevada1Used(false);
    setPreviousLoopState(null);
    
    saveToLocalStorage(ritmos, newRhythmName, audioStates);
  }, [ritmos, audioStates, saveToLocalStorage]);

  const addRitmo = useCallback((newRhythmName) => {
    setRitmos(prev => {
      if (prev[newRhythmName]) return prev;
      const next = { ...prev, [newRhythmName]: {} };
      saveToLocalStorage(next, rhythmName, audioStates);
      return next;
    });
  }, [rhythmName, audioStates, saveToLocalStorage]);

  const addAudioToRitmo = useCallback(async (targetRhythmName, audioType, audioBlob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setRitmos(prev => {
          const next = {
            ...prev,
            [targetRhythmName]: {
              ...(prev[targetRhythmName] || {}),
              [audioType]: dataUrl
            }
          };
          saveToLocalStorage(next, rhythmName, audioStates);
          return next;
        });
        resolve(dataUrl);
      };
      reader.readAsDataURL(audioBlob);
    });
  }, [rhythmName, audioStates, saveToLocalStorage]);

  const getAudiosForRitmo = useCallback((targetRhythmName) => {
    return ritmos[targetRhythmName] || {};
  }, [ritmos]);

  const setBpm = useCallback((newBpm) => {
    setBpmState(newBpm);
    audioManager.setBPM(newBpm);
  }, []);

  const scheduleNextAudio = useCallback(async (proximoAudioType, tipo) => {
    if (!rhythmName) return;
    const audios = getAudiosForRitmo(rhythmName);
    
    if (tipo === 'LEVADA 1' && levada1Used) return;
    if (tipo === 'LEVADA 1') setLevada1Used(true);

    // Dynamic rhythm-based path loading
    await audioManager.loadAudio(rhythmName, proximoAudioType, audios[proximoAudioType]);

    if (tipo === 'PRATO') {
      audioManager.playAudio(rhythmName, proximoAudioType, { loop: false, stopOthers: false });
      setActiveTypes(prev => new Set([...prev, proximoAudioType]));
      setTimeout(() => {
        setActiveTypes(prev => {
          const newSet = new Set(prev);
          newSet.delete(proximoAudioType);
          return newSet;
        });
      }, 1000);
      return;
    }

    const isPlayingOrScheduled = currentAudio || isScheduled;

    // Hard start / Initial play
    if (!isPlayingOrScheduled) {
      if (tipo === 'FINAL') {
        audioManager.playAudio(rhythmName, proximoAudioType, { loop: false, stopOthers: true });
        setCurrentAudioState(proximoAudioType);
        setActiveTypes(new Set([proximoAudioType]));
        setAudioStartTimeState(Date.now());
        setTimeout(() => setActiveTypes(new Set()), 2000);
      } else if (tipo.startsWith('VIRADA')) {
        setPreviousLoopState('LEVADA 1'); 
        
        audioManager.playVirada(rhythmName, proximoAudioType, {
          onStart: (playingType) => {
            setCurrentAudioState(playingType);
            setActiveTypes(new Set([playingType]));
          },
          onEnd: () => {
            setIsScheduledState(true);
            setNextAudioState('LEVADA 1');
            setCurrentAudioState(null);
            setActiveTypes(new Set());
            
            audioManager.agendarAudioComSincronismo('LEVADA 1', 'levada', barDuration, () => {
              audioManager.playAudio(rhythmName, 'LEVADA 1', { loop: true, stopOthers: true });
              setCurrentAudioState('LEVADA 1');
              setNextAudioState(null);
              setIsScheduledState(false);
              setActiveTypes(new Set(['LEVADA 1']));
              setAudioStartTimeState(Date.now());
              setPreviousLoopState(null);
            });
          }
        });
      } else {
        setPreviousLoopState(null);
        audioManager.playAudio(rhythmName, proximoAudioType, { loop: true, stopOthers: true });
        setCurrentAudioState(proximoAudioType);
        setActiveTypes(new Set([proximoAudioType]));
        setAudioStartTimeState(Date.now());
      }
      return;
    }

    // Scheduled transition
    setIsScheduledState(true);
    setNextAudioState(proximoAudioType);

    let levadaToReturn = previousLoop;
    if (tipo.startsWith('VIRADA')) {
      levadaToReturn = currentAudio?.startsWith('LEVADA') ? currentAudio : (previousLoop || 'LEVADA 1');
      setPreviousLoopState(levadaToReturn);
    } else if (tipo.startsWith('LEVADA')) {
      setPreviousLoopState(null);
    }

    audioManager.agendarAudioComSincronismo(proximoAudioType, tipo, barDuration, () => {
      if (tipo === 'FINAL') {
        audioManager.playAudio(rhythmName, proximoAudioType, { loop: false, stopOthers: true });
        setCurrentAudioState(null);
        setNextAudioState(null);
        setIsScheduledState(false);
        setActiveTypes(new Set([proximoAudioType]));
        setTimeout(() => setActiveTypes(new Set()), 2000);
      } else if (tipo.startsWith('VIRADA')) {
        setIsScheduledState(false);
        setNextAudioState(null);

        audioManager.playVirada(rhythmName, proximoAudioType, {
          onStart: (playingType) => {
            setCurrentAudioState(playingType);
            setActiveTypes(new Set([playingType]));
          },
          onEnd: () => {
            setIsScheduledState(true);
            setNextAudioState(levadaToReturn);
            setCurrentAudioState(null);
            setActiveTypes(new Set());
            
            audioManager.agendarAudioComSincronismo(levadaToReturn, 'levada', barDuration, () => {
              audioManager.playAudio(rhythmName, levadaToReturn, { loop: true, stopOthers: true });
              setCurrentAudioState(levadaToReturn);
              setNextAudioState(null);
              setIsScheduledState(false);
              setActiveTypes(new Set([levadaToReturn]));
              setAudioStartTimeState(Date.now());
              setPreviousLoopState(null);
            });
          }
        });
      } else {
        audioManager.playAudio(rhythmName, proximoAudioType, { loop: true, stopOthers: true });
        setCurrentAudioState(proximoAudioType);
        setNextAudioState(null);
        setIsScheduledState(false);
        setActiveTypes(new Set([proximoAudioType]));
        setAudioStartTimeState(Date.now());
      }
    });
  }, [currentAudio, isScheduled, rhythmName, barDuration, getAudiosForRitmo, levada1Used, previousLoop]);

  const trocarLevadaComVirada = useCallback(async (levadaNova) => {
    if (!currentAudio || !currentAudio.startsWith('LEVADA')) return;

    const viradaNum = identificarVirada(currentAudio, levadaNova);
    
    if (!viradaNum) {
      return scheduleNextAudio(levadaNova, levadaNova);
    }

    const viradaType = `VIRADA ${viradaNum}`;
    const audios = getAudiosForRitmo(rhythmName);

    await audioManager.loadAudio(rhythmName, viradaType, audios[viradaType]);
    await audioManager.loadAudio(rhythmName, levadaNova, audios[levadaNova]);

    setIsScheduledState(true);
    setNextAudioState(viradaType);
    setPreviousLoopState(levadaNova);

    audioManager.agendarAudioComSincronismo(viradaType, 'virada', barDuration, () => {
      setIsScheduledState(false);
      setNextAudioState(null);

      audioManager.playVirada(rhythmName, viradaType, {
        onStart: (playingType) => {
          setCurrentAudioState(playingType);
          setActiveTypes(new Set([playingType]));
        },
        onEnd: () => {
          setIsScheduledState(true);
          setNextAudioState(levadaNova);
          setCurrentAudioState(null);
          setActiveTypes(new Set());
          
          audioManager.agendarAudioComSincronismo(levadaNova, 'levada', barDuration, () => {
            audioManager.playAudio(rhythmName, levadaNova, { loop: true, stopOthers: true });
            setCurrentAudioState(levadaNova);
            setNextAudioState(null);
            setIsScheduledState(false);
            setActiveTypes(new Set([levadaNova]));
            setAudioStartTimeState(Date.now());
            setPreviousLoopState(null);
          });
        }
      });
    });
  }, [currentAudio, rhythmName, barDuration, getAudiosForRitmo, scheduleNextAudio]);

  const handlePadAction = useCallback(async (type) => {
    if (type.startsWith('LEVADA') && currentAudio?.startsWith('LEVADA') && currentAudio !== type) {
      await trocarLevadaComVirada(type);
    } else {
      await scheduleNextAudio(type, type);
    }
  }, [scheduleNextAudio, trocarLevadaComVirada, currentAudio]);

  const stopAll = useCallback(() => {
    audioManager.stopAllAudios();
    setCurrentAudioState(null);
    setNextAudioState(null);
    setIsScheduledState(false);
    setActiveTypes(new Set());
    setPreviousLoopState(null);
  }, []);

  const handleVolumeChange = useCallback((volume) => {
    setCurrentVolume(volume);
    audioManager.setVolume(volume);
  }, []);

  const value = {
    ritmos,
    rhythmName,
    setRhythmName,
    // Aliases to maintain backward compatibility
    selectedRitmo: rhythmName,
    setSelectedRitmo: setRhythmName,
    addRitmo,
    addAudioToRitmo,
    getAudiosForRitmo,
    
    bpm,
    setBpm,
    barDuration,
    currentAudio,
    setCurrentAudioState,
    nextAudio,
    setNextAudioState,
    audioStartTime,
    setAudioStartTimeState,
    isScheduled,
    scheduleNextAudio,
    trocarLevadaComVirada,
    
    previousLoop,
    setPreviousLoop: setPreviousLoopState,

    activeTypes,
    levada1Used,
    handlePadAction,
    stopAll,
    currentVolume,
    handleVolumeChange
  };

  return (
    <LoopManagerContext.Provider value={value}>
      {children}
    </LoopManagerContext.Provider>
  );
};

export const useLoopManager = () => {
  const context = useContext(LoopManagerContext);
  if (!context) {
    throw new Error('useLoopManager must be used within LoopManagerProvider');
  }
  return context;
};