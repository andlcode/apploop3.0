
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';
import { substituirAudio, excluirAudio } from '@/lib/audioFileManager.js';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';
import { UploadCloud, Trash2 } from 'lucide-react';

const AudioFileDialog = ({ isOpen, onClose, defaultTab = 'substituir' }) => {
  const { rhythmName } = useLoopManager();
  
  const [tipo, setTipo] = useState('levada');
  const [numero, setNumero] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const optionsTipo = [
    { value: 'levada', label: 'Levada' },
    { value: 'virada', label: 'Virada' },
    { value: 'final', label: 'Final' },
    { value: 'prato', label: 'Prato' }
  ];

  const getNumeros = () => {
    if (tipo === 'levada' || tipo === 'virada') return ['1', '2', '3', '4'];
    return ['']; // Final e Prato geralmente não têm número
  };

  const handleSubstituir = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    
    if (!file) {
      toast.error('Por favor, selecione um arquivo de áudio.');
      return;
    }

    setIsProcessing(true);
    const result = await substituirAudio(rhythmName, tipo, numero, file);
    setIsProcessing(false);

    if (result.success) {
      toast.success(result.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  const handleExcluir = async () => {
    setIsProcessing(true);
    const result = excluirAudio(rhythmName, tipo, numero);
    setIsProcessing(false);

    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  const formatName = (id) => {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-card-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Gerenciar Áudios - {formatName(rhythmName || '')}
          </DialogTitle>
          <DialogDescription>
            Personalize os arquivos de áudio apenas para o ritmo selecionado ({formatName(rhythmName || '')}).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-white/5">
            <TabsTrigger value="substituir" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <UploadCloud className="w-4 h-4 mr-2" />
              Substituir
            </TabsTrigger>
            <TabsTrigger value="excluir" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 - SUBSTITUIR */}
          <TabsContent value="substituir" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo-sub">Tipo de Áudio</Label>
                <Select value={tipo} onValueChange={(val) => { setTipo(val); setNumero(val === 'levada' || val === 'virada' ? '1' : ''); }}>
                  <SelectTrigger id="tipo-sub" className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {optionsTipo.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-sub">Número</Label>
                <Select value={numero} onValueChange={setNumero} disabled={!getNumeros()[0]}>
                  <SelectTrigger id="num-sub" className="bg-background/50 border-white/10">
                    <SelectValue placeholder="N/A" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNumeros().map((num, i) => (
                      <SelectItem key={i} value={num || 'default'}>{num || 'Único'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="arquivo">Novo Arquivo (.mp3, .wav)</Label>
              <input
                type="file"
                id="arquivo"
                accept="audio/*"
                ref={fileInputRef}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors bg-background/50 border border-white/10 rounded-md p-2"
              />
            </div>

            <Button 
              className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handleSubstituir}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Substituir Áudio'}
            </Button>
          </TabsContent>

          {/* TAB 2 - EXCLUIR */}
          <TabsContent value="excluir" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo-exc">Tipo de Áudio</Label>
                <Select value={tipo} onValueChange={(val) => { setTipo(val); setNumero(val === 'levada' || val === 'virada' ? '1' : ''); }}>
                  <SelectTrigger id="tipo-exc" className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {optionsTipo.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-exc">Número</Label>
                <Select value={numero} onValueChange={setNumero} disabled={!getNumeros()[0]}>
                  <SelectTrigger id="num-exc" className="bg-background/50 border-white/10">
                    <SelectValue placeholder="N/A" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNumeros().map((num, i) => (
                      <SelectItem key={i} value={num || 'default'}>{num || 'Único'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg mt-2 text-sm">
              Tem certeza que deseja excluir a personalização deste áudio do ritmo {formatName(rhythmName || '')}? O sistema voltará a usar o áudio padrão.
            </div>

            <Button 
              variant="destructive"
              className="w-full mt-4" 
              onClick={handleExcluir}
              disabled={isProcessing}
            >
              {isProcessing ? 'Excluindo...' : 'Excluir Personalização'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AudioFileDialog;
