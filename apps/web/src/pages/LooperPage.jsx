import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import LoopPadGrid from '@/components/LoopPadGrid.jsx';
import ControlPanel from '@/components/ControlPanel.jsx';
import { useLoopManager } from '@/contexts/LoopManagerContext.jsx';

const LooperPageContent = () => {
  const { selectedRitmo } = useLoopManager();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Loop Station Pro${selectedRitmo ? ` - ${selectedRitmo}` : ''}`}</title>
        <meta name="description" content="Interactive music loop station with real-time audio playback and advanced fill mechanics." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background relative selection:bg-primary/30">
        
        {/* Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        {/* Header remains visible at all times (Task 6) */}
        <Header />

        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            
            {/* Components are ALWAYS rendered, avoiding flicker (Task 6) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              <div className="w-full">
                <LoopPadGrid />
              </div>
              <div className="w-full">
                <ControlPanel />
              </div>
            </div>

          </div>
        </main>

        {/* Noise Texture Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-screen z-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>
    </>
  );
};

const LooperPage = () => {
  return <LooperPageContent />;
};

export default LooperPage;