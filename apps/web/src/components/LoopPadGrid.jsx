import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';

const LoopPadGrid = () => {
  const { 
    selectedRitmo, 
    getAudiosForRitmo, 
    activeTypes, 
    currentAudio,
    nextAudio,
    isScheduled,
    levada1Used, 
    handlePadAction 
  } = useLoopManager();

  const currentAudios = getAudiosForRitmo(selectedRitmo) || {};

  const PAD_CONFIG = [
    { type: 'LEVADA 1', colorClass: 'neon-border', glowClass: 'neon-glow', textClass: 'text-primary' },
    { type: 'LEVADA 2', colorClass: 'neon-border', glowClass: 'neon-glow', textClass: 'text-primary' },
    { type: 'LEVADA 3', colorClass: 'neon-border', glowClass: 'neon-glow', textClass: 'text-primary' },
    
    { type: 'LEVADA 4', colorClass: 'neon-border', glowClass: 'neon-glow', textClass: 'text-primary' },
    { type: 'VIRADA 1', colorClass: 'neon-border-secondary', glowClass: 'neon-glow-secondary', textClass: 'text-secondary' },
    { type: 'VIRADA 2', colorClass: 'neon-border-secondary', glowClass: 'neon-glow-secondary', textClass: 'text-secondary' },
    
    { type: 'VIRADA 3', colorClass: 'neon-border-secondary', glowClass: 'neon-glow-secondary', textClass: 'text-secondary' },
    { type: 'FINAL', colorClass: 'neon-border', glowClass: 'neon-glow', textClass: 'text-primary' },
    { type: 'PRATO', colorClass: 'neon-border-accent', glowClass: 'neon-glow-accent', textClass: 'text-accent' }
  ];

  const handleKeyPress = useCallback((event) => {
    const keyMap = {
      'q': 0, 'w': 1, 'e': 2,
      'a': 3, 's': 4, 'd': 5,
      'z': 6, 'x': 7, 'c': 8
    };

    const index = keyMap[event.key.toLowerCase()];
    if (index !== undefined && PAD_CONFIG[index]) {
      const pad = PAD_CONFIG[index];
      const hasAudio = !!currentAudios[pad.type];
      
      if (!hasAudio) return;
      if (pad.type === 'LEVADA 1' && levada1Used) return;
      
      handlePadAction(pad.type);
    }
  }, [handlePadAction, PAD_CONFIG, levada1Used, currentAudios]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-card/40 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {PAD_CONFIG.map((pad, index) => {
          const hasAudio = !!currentAudios[pad.type];
          const isLevada1 = pad.type === 'LEVADA 1';
          const isDisabled = !hasAudio || (isLevada1 && levada1Used);
          
          // Task 4: Visual Feedback based on scheduling
          const isActive = currentAudio === pad.type || activeTypes.has(pad.type);
          const isPending = isScheduled && nextAudio === pad.type;
          const rhythmDisplay = selectedRitmo ? ` - ${selectedRitmo}` : '';

          let containerClass = `
            relative aspect-[4/3] md:aspect-square rounded-2xl p-4
            bg-background/60 backdrop-blur-sm overflow-hidden
            flex flex-col items-center justify-center gap-2 group
            transition-all duration-300
          `;

          if (isDisabled) {
            containerClass += ` opacity-40 grayscale-[80%] cursor-not-allowed border border-white/5 bg-background/20`;
          } else {
            containerClass += `
              ${pad.colorClass}
              ${isActive || isPending ? pad.glowClass : 'opacity-90 hover:opacity-100'}
              hover:-translate-y-1 active:scale-95 active:translate-y-0
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer
            `;
          }

          return (
            <motion.button
              key={pad.type}
              onClick={isDisabled ? undefined : () => handlePadAction(pad.type)}
              className={containerClass}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              title={!hasAudio ? "Áudio não carregado para este botão" : ""}
            >
              
              {/* Scheduled Visual Feedback */}
              {isPending && !isDisabled && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary/20 border border-primary/50 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                  Agendado
                </div>
              )}

              {/* Active / Pending Pulse Indicator */}
              {!isDisabled && (
                <div className="absolute top-3 right-3 flex items-center justify-center w-4 h-4">
                  <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-current' : isPending ? 'bg-current animate-pulse' : 'bg-muted/30'}`} />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 border border-current rounded-full"
                      animate={{ scale: [1, 2.5], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  {isPending && !isActive && (
                    <motion.div
                      className="absolute inset-0 border border-current rounded-full border-dashed"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              )}

              <span className={`text-sm md:text-lg font-extrabold uppercase tracking-widest text-center ${isDisabled ? 'text-muted-foreground' : pad.textClass} ${(isActive || isPending) && !isDisabled ? 'glow-effect' : ''} text-balance transition-colors mt-2`}>
                {pad.type}
                <span className="block text-[10px] md:text-xs opacity-70 mt-1 tracking-widest font-semibold">{hasAudio ? rhythmDisplay : 'SEM ÁUDIO'}</span>
              </span>

              {!isDisabled && (
                <span className="absolute bottom-2 left-3 text-[10px] font-bold text-muted-foreground uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                  {['Q','W','E','A','S','D','Z','X','C'][index]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LoopPadGrid;