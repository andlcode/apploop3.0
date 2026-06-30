
import React from 'react';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Music } from 'lucide-react';

const RhythmSelector = () => {
  const { rhythmName, setRhythmName, ritmos } = useLoopManager();
  
  // Default available base rhythms
  const baseRhythms = [
    { id: 'pop-rock-1', name: 'Pop Rock 1' }
  ];

  // Merge any dynamically added rhythms from Context/LocalStorage
  const allRhythmIds = Array.from(new Set([...baseRhythms.map(r => r.id), ...Object.keys(ritmos)]));
  
  const formatName = (id) => {
    const found = baseRhythms.find(r => r.id === id);
    if (found) return found.name;
    // Format "pop-rock-1" -> "Pop Rock 1"
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-sm mt-2">
      <label htmlFor="rhythm-select" className="text-[10px] text-primary/80 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
        <Music className="w-3 h-3" />
        Ritmo Atual
      </label>
      <Select value={rhythmName} onValueChange={setRhythmName}>
        <SelectTrigger 
          id="rhythm-select" 
          className="w-full bg-background/80 text-foreground border border-primary/40 rounded-lg px-4 h-12 outline-none focus:ring-2 focus:ring-primary/60 uppercase font-extrabold text-sm transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] cursor-pointer"
        >
          <SelectValue placeholder="Selecione um ritmo" />
        </SelectTrigger>
        <SelectContent className="bg-card border-primary/20">
          {allRhythmIds.map(id => (
            <SelectItem 
              key={id} 
              value={id} 
              className="uppercase font-bold cursor-pointer hover:bg-primary/20 focus:bg-primary/20 focus:text-primary transition-colors"
            >
              {formatName(id)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RhythmSelector;
