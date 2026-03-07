"use client";
import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  defaultDropAnimationSideEffects,
  PointerSensor,
  useSensor,
  useSensors 
} from '@dnd-kit/core';
import { getLoops } from '../lib/api'; 
import Metronome from '../components/Metronome';
import LoopSlot from '../components/LoopSlot';
import DraggableLoop from '../components/DraggableLoop';
import MasterSpectrogram from '../components/MasterSpectogram';

export default function Home() {
  const [loops, setLoops] = useState<any[]>([]);
  const [isWarpEnabled, setIsWarpEnabled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLoopData, setActiveLoopData] = useState<any>(null);
  const [slots, setSlots] = useState<{ [key: string]: any }>({
    'slot-1': null, 'slot-2': null, 'slot-3': null, 'slot-4': null
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    getLoops().then(setLoops).catch(console.error);
  }, []);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveLoopData(event.active.data.current);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && slots.hasOwnProperty(over.id)) {
      setSlots(prev => ({ ...prev, [over.id]: active.data.current }));
    }
    setActiveId(null);
    setActiveLoopData(null);
  };

  const dropAnimationConfig = {
    duration: 0,
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0' } },
    }),
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <main className="flex h-screen bg-slate-950 overflow-hidden text-white font-sans">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="w-full h-64 border-b border-white/5 bg-black">
            <MasterSpectrogram />
          </header>

          <section className="flex-1 p-12 overflow-y-auto flex flex-col items-center">
            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
              {Object.entries(slots).map(([id, loop]) => (
                <LoopSlot 
                  key={`slot-container-${id}`} 
                  id={id} 
                  activeLoop={loop} 
                  isWarpEnabled={isWarpEnabled} 
                />
              ))}
            </div>
          </section>

          <footer className="p-8 border-t border-white/5 bg-slate-900/20 backdrop-blur-md flex justify-center">
            <Metronome 
              isWarpEnabled={isWarpEnabled} 
              onWarpToggle={() => setIsWarpEnabled(!isWarpEnabled)} 
            />
          </footer>
        </div>

        <aside className="w-72 border-l border-white/5 bg-slate-900/40 p-6 flex flex-col">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Loop Rack</h2>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {loops.map((loop) => (
              <DraggableLoop 
                key={`rack-loop-${loop.id}`} 
                loop={loop} 
              />
            ))}
          </div>
        </aside>
      </main>

      {/* SUBTLE DRAG OVERLAY FIX */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/50 backdrop-blur-md shadow-2xl w-64 rotate-2 scale-105 pointer-events-none cursor-grabbing">
            <div className="flex justify-between items-start mb-1">
              {/* Using text-purple-400 to match the hover font color */}
              <span className="font-bold text-purple-400 text-base leading-tight">
                {activeLoopData?.name}
              </span>
              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                {activeLoopData?.bpm} BPM
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}