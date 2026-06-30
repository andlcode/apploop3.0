
import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import AudioUploadManager from './AudioUploadManager.jsx';
import RhythmSelector from './RhythmSelector.jsx';
import BeatIndicator from './BeatIndicator.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';

const Header = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { bpm, currentAudio } = useLoopManager();
  
  // Consider loop playing if any audio is actively tracked in state
  const isPlaying = !!currentAudio;

  return (
    <>
      <header className="w-full bg-card/50 backdrop-blur-md border-b border-primary/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            
            {/* Left: Branding */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary glow-effect uppercase tracking-widest leading-none">
                Apploop
              </h1>
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center mt-1">
                <span className="text-[10px] text-primary/50 uppercase font-bold text-center leading-tight px-1">Logo<br/>Here</span>
              </div>
            </div>

            {/* Middle: Synchronization / Beat Indicator */}
            <div className="flex-1 flex justify-center w-full md:w-auto">
              <BeatIndicator bpm={bpm} isPlaying={isPlaying} />
            </div>

            {/* Right: Rhythm Selection & Controls */}
            <div className="flex flex-col md:flex-row w-full md:w-auto mt-2 md:mt-0 items-start md:items-end gap-4 justify-end">
              
              <RhythmSelector />

              <Button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider h-12 px-6 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all shrink-0 mt-2 md:mt-0"
              >
                <UploadCloud className="w-5 h-5 mr-2" />
                Upload Áudios
              </Button>
            </div>

          </div>
        </div>
      </header>
      
      <AudioUploadManager isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </>
  );
};

export default Header;
