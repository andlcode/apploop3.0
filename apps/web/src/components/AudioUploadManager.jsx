
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { UploadCloud, FileAudio, X, Music } from 'lucide-react';
import { reconhecerArquivo } from '@/lib/rhythmManager.js';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';

const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];

const getFileExtension = (fileName) => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return fileName.slice(dotIndex).toLowerCase();
};

const isAudioFile = (file) => {
  if (file.type?.startsWith('audio/')) return true;
  return ALLOWED_AUDIO_EXTENSIONS.includes(getFileExtension(file.name));
};

const AudioUploadManager = ({ isOpen, onOpenChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rejectedFilesMessage, setRejectedFilesMessage] = useState('');
  
  // Rhythm Selection State
  const { ritmos, selectedRitmo, setSelectedRitmo, addRitmo, addAudioToRitmo } = useLoopManager();
  const availableRhythms = Object.keys(ritmos);
  
  const [targetRhythmSelection, setTargetRhythmSelection] = useState("");
  const [newRhythmName, setNewRhythmName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fileInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  // Reset fila e sincroniza ritmo apenas quando o modal abre (false → true)
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!justOpened) return;

    if (selectedRitmo) {
      setTargetRhythmSelection(selectedRitmo);
      setIsCreatingNew(false);
    } else if (availableRhythms.length > 0) {
      setTargetRhythmSelection(availableRhythms[0]);
      setIsCreatingNew(false);
    } else {
      setTargetRhythmSelection('new');
      setIsCreatingNew(true);
    }
    setSelectedFiles([]);
    setUploadProgress(0);
    setNewRhythmName('');
    setRejectedFilesMessage('');
  }, [isOpen, selectedRitmo, availableRhythms.length]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const filterAudioFiles = useCallback((files) => {
    const fileList = Array.from(files);
    const audioFiles = fileList.filter(isAudioFile);
    const rejectedCount = fileList.length - audioFiles.length;

    if (rejectedCount > 0) {
      if (audioFiles.length === 0) {
        const message =
          'Nenhum arquivo de áudio válido foi selecionado. Use arquivos .mp3, .wav ou .ogg.';
        setRejectedFilesMessage(message);
        toast.error(message);
      } else {
        setRejectedFilesMessage('');
        toast.warning(
          `Alguns arquivos foram ignorados (${rejectedCount}). Apenas .mp3, .wav e .ogg são aceitos.`
        );
      }
    }

    return audioFiles;
  }, []);

  const applyFileSelection = useCallback(
    (files) => {
      if (!files?.length) return;

      const validFiles = filterAudioFiles(files);
      if (validFiles.length > 0) {
        setRejectedFilesMessage('');
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [filterAudioFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.length) {
        applyFileSelection(e.dataTransfer.files);
      }
    },
    [applyFileSelection]
  );

  const handleChange = (e) => {
    if (e.target.files?.length) {
      applyFileSelection(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const finalRhythmName = isCreatingNew ? newRhythmName.trim().toUpperCase() : targetRhythmSelection;
    
    if (!finalRhythmName) {
      toast.error('Por favor, selecione ou digite o nome de um ritmo.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10);
    
    // Ensure rhythm exists
    addRitmo(finalRhythmName);
    
    // Set as active rhythm if it isn't already
    if (selectedRitmo !== finalRhythmName) {
      setSelectedRitmo(finalRhythmName);
    }
    
    let processed = 0;
    
    for (const file of selectedFiles) {
      // 1) Normalize and recognize
      const audioType = reconhecerArquivo(file.name, finalRhythmName);
      
      if (audioType) {
        // 2) Convert file to blob/dataURL and add to context
        await addAudioToRitmo(finalRhythmName, audioType, file);
        // 3) Show success toast
        toast.success(`Áudio reconhecido: ${file.name} como ${audioType}`);
      } else {
        // 4) Show warning toast
        toast.warning(`Áudio não reconhecido: ${file.name}. Verifique o nome do arquivo.`);
      }
      
      processed++;
      setUploadProgress(10 + (processed / selectedFiles.length) * 90);
    }
    
    // Clean up queue, but DO NOT close dialog or clear selected rhythm (Tasks 3.5, 3.6, 3.7)
    setTimeout(() => {
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      toast.info('Upload processado. Os botões ativos foram atualizados no grid.');
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUploading) onOpenChange(open);
    }}>
      <DialogContent className="bg-card border-primary/20 neon-border max-w-xl text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary glow-effect flex items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            Upload de Áudios
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Faça upload dos seus arquivos. O sistema reconhecerá automaticamente com base no nome (ex: <code className="text-primary bg-primary/5 px-1 rounded">LEVADA 1.mp3</code>).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* Rhythm Selection */}
          <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-primary/10">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/80">Destino do Ritmo</Label>
            <Select 
              value={isCreatingNew ? "new" : targetRhythmSelection} 
              onValueChange={(val) => {
                if (val === "new") {
                  setIsCreatingNew(true);
                  setTargetRhythmSelection("new");
                } else {
                  setIsCreatingNew(false);
                  setTargetRhythmSelection(val);
                }
              }}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full bg-card border-primary/30 uppercase font-bold text-sm">
                <SelectValue placeholder="Selecione um ritmo existente" />
              </SelectTrigger>
              <SelectContent>
                {availableRhythms.map((rhythm) => (
                  <SelectItem key={rhythm} value={rhythm} className="uppercase font-bold">
                    {rhythm}
                  </SelectItem>
                ))}
                <SelectItem value="new" className="text-primary font-bold">
                  + CRIAR NOVO RITMO...
                </SelectItem>
              </SelectContent>
            </Select>

            {isCreatingNew && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <Input 
                  placeholder="DIGITE O NOME DO NOVO RITMO" 
                  value={newRhythmName}
                  onChange={(e) => setNewRhythmName(e.target.value.toUpperCase())}
                  className="uppercase font-bold border-primary/50 text-foreground focus-visible:ring-primary/50"
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {/* Drag & Drop Zone */}
          <div 
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden
              ${dragActive ? 'border-primary bg-primary/10 neon-glow' : 'border-primary/30 bg-background/50 hover:border-primary/60 hover:bg-primary/5'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg"
              onChange={handleChange}
              className="hidden" 
            />
            
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <FileAudio className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold uppercase mb-1">
              Arraste os arquivos aqui
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar no computador
            </p>
            
            <Button variant="secondary" className="pointer-events-none bg-primary/20 text-primary hover:bg-primary/30 uppercase text-xs font-bold tracking-wider">
              Selecionar Arquivos
            </Button>
          </div>

          {rejectedFilesMessage && (
            <div
              role="alert"
              className="text-sm text-destructive border border-destructive/30 bg-destructive/10 px-4 py-3 rounded-lg"
            >
              {rejectedFilesMessage}
            </div>
          )}

          {/* Upload Progress & Action */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">
                  Arquivos na Fila ({selectedFiles.length})
                </h4>
                {!isUploading && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                    Limpar Todos
                  </Button>
                )}
              </div>

              <ScrollArea className="h-40 rounded-md border border-primary/10 bg-background/50 p-2">
                <div className="space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-card p-2 rounded-lg border border-primary/5">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Music className="w-4 h-4 text-primary/60 shrink-0" />
                        <span className="text-sm truncate opacity-90">{file.name}</span>
                      </div>
                      {!isUploading && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFile(idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {isUploading ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-primary uppercase">
                    <span>Processando...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              ) : (
                <Button 
                  onClick={handleUpload} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider neon-glow"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  PROCESSAR EM {isCreatingNew ? (newRhythmName || 'NOVO RITMO') : targetRhythmSelection}
                </Button>
              )}
              
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioUploadManager;
