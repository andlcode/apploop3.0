
import React from 'react';
import { FolderOpen, FileAudio, RotateCw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';

const UploadPanel = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-primary/20 neon-border max-w-2xl text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary glow-effect">
            Instalação de Ritmos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Os ritmos agora devem ser adicionados diretamente no diretório do projeto para melhor performance.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/50 border border-primary/10 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm uppercase">1. Crie a Pasta</h3>
              <p className="text-xs text-muted-foreground">
                Vá até a pasta <code className="text-primary bg-primary/5 px-1 rounded">/public/audio/loops/</code> e crie uma subpasta com o nome do ritmo (ex: <code className="text-primary bg-primary/5 px-1 rounded">POP ROCK 1</code>).
              </p>
            </div>

            <div className="bg-background/50 border border-primary/10 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileAudio className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm uppercase">2. Adicione os Áudios</h3>
              <p className="text-xs text-muted-foreground">
                Coloque os 9 arquivos mp3 dentro da pasta. Siga o formato exato: <br/> <code className="text-primary bg-primary/5 px-1 rounded block mt-1">POP ROCK 1 LEVADA 1.mp3</code>
              </p>
            </div>

            <div className="bg-background/50 border border-primary/10 rounded-xl p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <RotateCw className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm uppercase">3. Recarregue</h3>
              <p className="text-xs text-muted-foreground">
                Após organizar os arquivos, pressione a tecla <strong>F5</strong> no seu navegador. O sistema detectará o ritmo automaticamente.
              </p>
            </div>
          </div>

          <div className="bg-secondary text-secondary-foreground border border-border/50 rounded-lg p-5">
            <h4 className="flex items-center gap-2 font-bold uppercase text-sm mb-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Arquivos Necessários
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-secondary-foreground/80">
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... LEVADA 1.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... LEVADA 2.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... LEVADA 3.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... LEVADA 4.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... VIRADA 1.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... VIRADA 2.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... VIRADA 3.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... FINAL.mp3</div>
              <div className="bg-background/30 px-2 py-1.5 rounded truncate">... PRATO.mp3</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPanel;
