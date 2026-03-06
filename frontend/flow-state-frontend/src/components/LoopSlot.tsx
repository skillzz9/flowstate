"use client";
import { useDroppable } from '@dnd-kit/core';
import SyncedLoop from './SyncedLoop';

export default function LoopSlot({ id, activeLoop, isWarpEnabled }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`relative rounded-3xl border-2 transition-all min-h-[160px] flex items-center justify-center
        ${isOver ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'border-slate-800 bg-slate-900/20'}
        ${activeLoop ? 'border-transparent bg-transparent' : 'border-dashed'}`}
    >
      {activeLoop ? (
        <div className="w-full">
          <SyncedLoop 
            loopUrl={activeLoop.audio_file} 
            loopName={activeLoop.name} 
            isWarpEnabled={isWarpEnabled} 
          />
        </div>
      ) : (
        <span className="text-slate-700 font-mono text-[10px] uppercase tracking-widest">Empty Slot</span>
      )}
    </div>
  );
}