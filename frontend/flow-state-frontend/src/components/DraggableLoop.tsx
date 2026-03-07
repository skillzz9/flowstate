"use client";
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableLoop({ loop }: { loop: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: loop.id.toString(),
    data: loop,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative bg-slate-800/40 border border-white/5 p-4 rounded-xl transition-all duration-300 hover:bg-slate-800 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] active:scale-95"
    >
      <div className="flex items-center justify-between">
        {/* Title remains lowercase/original as requested */}
        <span className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
          {loop.name}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-purple-500 transition-colors" />
      </div>

      <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-3">
        <div className="flex gap-4 mb-3 border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Key</span>
            <span className="text-xs font-mono text-purple-300">{loop.key || 'D Minor'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Tempo</span>
            <span className="text-xs font-mono text-purple-300">{loop.bpm} BPM</span>
          </div>
        </div>

        {/* Tag Fix: Safely accessing the name property from the many-to-many objects */}
        <div className="flex flex-wrap gap-1">
          {loop.tags && loop.tags.length > 0 ? (
            loop.tags.map((tag: any, index: number) => (
              <span 
                key={`loop-${loop.id}-tag-${tag.id || index}`} 
                className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400/80 font-medium"
              >
                #{tag.name || tag.label || (typeof tag === 'string' ? tag : 'tag')}
              </span>
            ))
          ) : (
            <span className="text-[9px] italic text-slate-600">Untagged</span>
          )}
        </div>
      </div>
    </div>
  );
}