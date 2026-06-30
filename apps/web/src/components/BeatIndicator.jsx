
import React, { useEffect, useState } from 'react';
import audioManager from '@/lib/audioManager.js';

const BeatIndicator = ({ bpm, isPlaying }) => {
  const [activeBeat, setActiveBeat] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      setActiveBeat(0);
      return;
    }

    let animationFrame;
    const tick = () => {
      // Return early if masterSyncTime hasn't been set yet
      if (!audioManager.masterSyncTime) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }

      const beatDuration = (60 / bpm) * 1000;
      const measureDuration = beatDuration * 4;
      
      // Calculate elapsed time relative to the sync anchor
      let elapsed = (Date.now() - audioManager.masterSyncTime) % measureDuration;
      
      // Handle negative modulos safely (if sync time represents a future anchor)
      if (elapsed < 0) elapsed += measureDuration;
      
      // Calculate current beat index (1 to 4)
      const currentBeat = Math.floor(elapsed / beatDuration) + 1;
      
      setActiveBeat(currentBeat);
      animationFrame = requestAnimationFrame(tick);
    };
    
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [bpm, isPlaying]);

  return (
    <div className="flex gap-3 items-center justify-center px-6 py-3 bg-card/60 backdrop-blur-md rounded-full border border-primary/20 shadow-inner shadow-primary/5">
      {[1, 2, 3, 4].map(beat => (
        <div 
          key={beat} 
          className={`beat-circle ${activeBeat === beat ? 'active' : ''}`}
          aria-label={`Tempo ${beat}`}
        />
      ))}
    </div>
  );
};

export default BeatIndicator;
