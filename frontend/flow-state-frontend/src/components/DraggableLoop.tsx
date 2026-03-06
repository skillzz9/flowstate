"use client";
import { useDraggable } from '@dnd-kit/core';

export default function DraggableLoop({ loop }: { loop: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${loop.id}`,
    data: loop, // This sends the name and audio_file URL to the slot
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-colors z-50 shadow-xl"
    >
      <div className="flex justify-between items-center pointer-events-none">
        <span className="text-sm font-bold text-slate-200">{loop.name}</span>
        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
          {loop.type || 'Loop'}
        </span>
      </div>
    </div>
  );
}