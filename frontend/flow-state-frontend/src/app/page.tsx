"use client";
import { useEffect, useState } from 'react';
import { getLoops } from '../lib/api';
import Metronome from '../components/Metronome';

// Define what a Loop looks like based on your Django model
interface AudioLoop {
  id: number;
  name: string;
  audio_file: string; 
  bpm: number;
  key: string;
  tags: string[];
}

export default function Home() {
  const [loops, setLoops] = useState<AudioLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoops()
      .then((data) => {
        setLoops(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono">Loading Flow State...</div>;

  return (
    <main className="min-h-screen bg-white p-8">
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900">FLOW STATE</h1>
        <p className="text-slate-500 mt-2">Direct access to your Django audio library.</p>
      </header>
      <Metronome />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loops.map((loop) => (
          <div key={loop.id} className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">{loop.name}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded uppercase">{loop.bpm} BPM</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">{loop.key}</span>
              </div>
            </div>

            {/* Simple Browser Player - No Sync Logic */}
            <audio 
              controls 
              src={loop.audio_file} 
              className="w-full h-8 opacity-70 group-hover:opacity-100 transition-opacity"
            />
            
            <div className="mt-4 flex flex-wrap gap-1">
              {loop.tags.map(tag => (
                <span key={tag} className="text-xs text-slate-400">#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}