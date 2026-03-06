"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref for the synth sound and the loop ID
  const clickSynth = useRef<Tone.MembraneSynth | null>(null);
  const loopId = useRef<number | null>(null);
  const beatCount = useRef(0);

  useEffect(() => {
    // 1. Setup the "Click" sound
    clickSynth.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.0006, decay: 0.1, sustain: 0 }
    }).toDestination();

    // 2. Setup the internal loop logic
    const loop = new Tone.Loop((time) => {
      const isDownbeat = beatCount.current === 0;
      
      // Play high-pitched click on Beat 1, lower on 2, 3, 4
      clickSynth.current?.triggerAttackRelease(isDownbeat ? "G3" : "C3", "16n", time);

      // Log to console exactly when the sound triggers
      Tone.getDraw().schedule(() => {
        console.log(`Beat: ${beatCount.current + 1}`);
        beatCount.current = (beatCount.current + 1) % 4;
      }, time);
    }, "4n");

    loop.start(0);

    return () => {
      loop.dispose();
      clickSynth.current?.dispose();
    };
  }, []);

  const toggleMetronome = async () => {
  if (Tone.getContext().state !== 'running') await Tone.start();

  if (isPlaying) {
    Tone.getTransport().stop();
    // Reset the position so the next start is at the absolute beginning
    Tone.getTransport().position = 0; 
  } else {
    Tone.getTransport().bpm.value = bpm;
    // Start the clock! Any "queued" loops will now trigger on the next downbeat.
    Tone.getTransport().start();
  }
  setIsPlaying(!isPlaying);
};

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    Tone.getTransport().bpm.value = newBpm;
  };

  return (
    <div className="flex flex-col items-center p-12 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-white text-5xl font-mono font-black mb-2">{bpm}</h1>
        <p className="text-slate-500 text-xs tracking-[0.2em] uppercase font-bold">Beats Per Minute</p>
      </div>

      <input 
        type="range" min="40" max="220" value={bpm} 
        onChange={(e) => handleBpmChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-10"
      />

      <button 
        onClick={toggleMetronome}
        className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all ${
          isPlaying 
            ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
        }`}
      >
        {isPlaying ? 'STOP' : 'START'}
      </button>
    </div>
  );
}