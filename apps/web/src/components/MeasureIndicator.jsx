
import React from 'react';
import { motion } from 'framer-motion';

const MeasureIndicator = ({ currentBeat = 0 }) => {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3].map((beat) => (
        <motion.div
          key={beat}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            currentBeat === beat
              ? 'bg-primary neon-glow scale-125'
              : 'bg-muted/30 border border-primary/20'
          }`}
          animate={{
            scale: currentBeat === beat ? 1.25 : 1,
            opacity: currentBeat === beat ? 1 : 0.5
          }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );
};

export default MeasureIndicator;
