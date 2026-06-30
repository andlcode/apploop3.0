
import React, { useState } from 'react';
import { Minus, Plus, Square as SquareSquare, Clock, UploadCloud, Trash2 } from 'lucide-react';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import AudioFileDialog from '@/components/AudioFileDialog.jsx';

const ControlPanel = () => {
  const { 
    bpm, 
    setBpm,
    barDuration,
    currentVolume, 
    handleVolumeChange,
    stopAll
  } = useLoopManager();

  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);
  const [dialogDefaultTab, setDialogDefaultTab] = useState('substituir');

  const handleBpmInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setBpm(value);
    }
  };

  const clampBpm = () => {
    if (bpm < 60) setBpm(60);
    if (bpm > 200) setBpm(200);
  };

  const openAudioDialog = (tab) => {
    setDialogDefaultTab(tab);
    setIsAudioDialogOpen(true);
  };

  return (
    <div className="w-full bg-card/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-8 shadow-2xl relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Stop Button */}
      <div className="flex justify-center">
        <Button
          onClick={stopAll}
          className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border-2 border-destructive/40 hover:border-destructive font-extrabold uppercase tracking-widest py-8 rounded-xl transition-all duration-200"
        >
          <SquareSquare className="w-6 h-6 mr-3 fill-current opacity-80" />
          Parar Tudo
        </Button>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

      {/* BPM & Bar Duration Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            BPM / Tempo
          </span>
          <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-white/5">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary hover:bg-primary/20 hover:text-primary rounded-md"
              onClick={() => bpm > 60 && setBpm(bpm - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={bpm}
              onChange={handleBpmInput}
              onBlur={clampBpm}
              min={60}
              max={200}
              className="h-8 w-16 px-1 py-0 text-center font-black text-primary glow-effect font-mono tracking-tighter bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary hover:bg-primary/20 hover:text-primary rounded-md"
              onClick={() => bpm < 200 && setBpm(bpm + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Slider
          value={[bpm]}
          onValueChange={(value) => setBpm(value[0])}
          min={60}
          max={200}
          step={1}
          className="w-full py-2 cursor-pointer"
        />

        <div className="flex items-center justify-center gap-2 mt-3 bg-muted/20 py-2 px-3 rounded-lg border border-white/5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground font-mono">
            Duração Compasso: <strong className="text-foreground">{barDuration.toFixed(2)}s</strong>
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

      {/* Volume Control */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Master Volume
          </span>
          <span className="text-lg font-black text-secondary glow-effect-secondary font-mono tracking-tighter">
            {currentVolume}%
          </span>
        </div>
        <Slider
          value={[currentVolume]}
          onValueChange={(value) => handleVolumeChange(value[0])}
          min={0}
          max={100}
          step={1}
          className="w-full py-2 cursor-pointer"
        />
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

      {/* Gerenciamento de Áudios */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
          Gerenciar Áudios
        </span>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full bg-background/50 border-white/10 hover:bg-primary/10 hover:text-primary"
            onClick={() => openAudioDialog('substituir')}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Substituir
          </Button>
          <Button 
            variant="outline" 
            className="w-full bg-background/50 border-white/10 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => openAudioDialog('excluir')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {isAudioDialogOpen && (
        <AudioFileDialog 
          isOpen={isAudioDialogOpen} 
          onClose={() => setIsAudioDialogOpen(false)} 
          defaultTab={dialogDefaultTab}
        />
      )}

    </div>
  );
};

export default ControlPanel;
