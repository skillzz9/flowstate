"use client";
import { useEffect, useState } from 'react';
import { getLoops } from '../lib/api'; // Your fetcher
import SyncedLoop from '../components/SyncedLoop';
import Metronome from '../components/Metronome';

export default function Home() {
  const [loops, setLoops] = useState<any[]>([]);

  useEffect(() => {
    // Fetch your loops from Django
    getLoops().then(setLoops).catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      {/* 1. The Global Clock */}
      <section className="mb-12 flex justify-center">
        <Metronome />
      </section>

      {/* 2. The Soundboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {loops.map((loop) => (
          <SyncedLoop 
            key={loop.id} 
            loopUrl={loop.audio_file} // This is the URL from your Django backend
            loopName={loop.name} 
          />
        ))}
      </div>
    </main>
  );
}