"use client";
import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { getLoops } from '../lib/api'; 

// Components
import Metronome from '../components/Metronome';
import LoopSlot from '../components/LoopSlot';
import DraggableLoop from '../components/DraggableLoop';
import MasterSpectrogram from '../components/MasterSpectogram';

export default function Home() {
  const [loops, setLoops] = useState<any[]>([]);
  const [slots, setSlots] = useState<{ [key: string]: any }>({
    'slot-1': null, 'slot-2': null, 'slot-3': null, 'slot-4': null
  });

  // Fetch your loops from the Django backend
  useEffect(() => {
    getLoops().then(setLoops).catch(console.error);
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    // Check if the drop target is one of our valid slots
    if (over && slots.hasOwnProperty(over.id)) {
      setSlots(prev => ({
        ...prev,
        [over.id]: active.data.current 
      }));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <main className="flex h-screen bg-slate-950 overflow-hidden text-white font-sans">
        
        {/* MAIN PRODUCTION AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* 1. TOP: MASTER SCROLLING SPECTROGRAM */}
          <header className="w-full h-64 border-b border-white/5 bg-black shadow-2xl">
            <MasterSpectrogram />
          </header>

          {/* 2. CENTER: DRAG & DROP SLOTS */}
          <section className="flex-1 p-12 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Active Session</h3>
                <span className="text-[10px] text-blue-500 font-mono">4 SLOTS AVAILABLE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                {Object.entries(slots).map(([id, loop]) => (
                  <LoopSlot key={id} id={id} activeLoop={loop} />
                ))}
              </div>
            </div>
          </section>

          {/* 3. BOTTOM: MASTER CLOCK (METRONOME) */}
          <footer className="p-8 border-t border-white/5 bg-slate-900/20 backdrop-blur-md flex justify-center">
            <Metronome />
          </footer>
        </div>

        {/* SIDEBAR RACK (THE LIBRARY) */}
        <aside className="w-80 border-l border-white/5 bg-slate-900/60 p-6 flex flex-col shadow-2xl">
          <div className="mb-8">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Thesis Project</h2>
            <h1 className="text-xl font-bold tracking-tight">Loop Library</h1>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {loops.length > 0 ? (
              loops.map((loop) => (
                <DraggableLoop key={loop.id} loop={loop} />
              ))
            ) : (
              <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-600 italic">Connecting to Django...</p>
              </div>
            )}
          </div>
        </aside>

      </main>
    </DndContext>
  );
}