"use client";
import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { getLoops } from '../lib/api'; 
import Metronome from '../components/Metronome';
import LoopSlot from '../components/LoopSlot';
import DraggableLoop from '../components/DraggableLoop';

export default function Home() {
  const [loops, setLoops] = useState<any[]>([]);
  const [slots, setSlots] = useState<{ [key: string]: any }>({
    'slot-1': null, 'slot-2': null, 'slot-3': null, 'slot-4': null
  });

  useEffect(() => {
    getLoops().then(setLoops).catch(console.error);
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    // If we dropped a loop over a valid slot
    if (over && slots.hasOwnProperty(over.id)) {
      setSlots(prev => ({
        ...prev,
        [over.id]: active.data.current // Transfer loop data to slot
      }));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <main className="flex h-screen bg-slate-950 overflow-hidden text-white">
        
        {/* PRODUCTION AREA */}
        <div className="flex-1 p-10 overflow-y-auto flex flex-col items-center">
          <Metronome />
          
          <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mt-12">
            {Object.entries(slots).map(([id, loop]) => (
              <LoopSlot key={id} id={id} activeLoop={loop} />
            ))}
          </div>
        </div>

        {/* SIDEBAR RACK */}
        <aside className="w-72 border-l border-white/5 bg-slate-900/40 p-6 flex flex-col">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Loop Rack</h2>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {loops.map((loop) => (
              <DraggableLoop key={loop.id} loop={loop} />
            ))}
          </div>
        </aside>

      </main>
    </DndContext>
  );
}