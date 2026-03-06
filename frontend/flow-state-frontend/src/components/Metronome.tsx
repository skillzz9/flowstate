"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function Metronome({ isWarpEnabled, onWarpToggle }: any) {
  const [bpm, setBpm] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMetronomeAudible, setIsMetronomeAudible] = useState(false);

  const synth = useRef<Tone.MembraneSynth | null>(null);
  const volumeGate = useRef<Tone.Volume | null>(null);

  useEffect(() => {
    // 1. Create a Volume node to act as our "Mute/Unmute" gate
    // We start at -Infinity (Total Silence)
    volumeGate.current = new Tone.Volume(-Infinity).toDestination();

    // 2. Initialize the Synth and connect it to the Gate
    synth.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      oscillator: { type: "sine" }
    }).connect(volumeGate.current);

    // 3. Schedule the repeat ONCE. It runs forever in the background
    // as long as Tone.Transport is 'started'.
    const loopId = Tone.getTransport().scheduleRepeat((time) => {
      const position = Tone.getTransport().position.toString().split(":");
      const beat = position[1];
      
      if (beat === "0") {
        // Accented Downbeat (The 1)
        synth.current?.triggerAttackRelease("C4", "32n", time, 1.0);
      } else {
        // Subtle Beats (2, 3, 4)
        synth.current?.triggerAttackRelease("G3", "32n", time, 0.4);
      }
    }, "4n");

    return () => {
      Tone.getTransport().clear(loopId);
      synth.current?.dispose();
      volumeGate.current?.dispose();
    };
  }, []);

  // 4. THE GATE LOGIC: This is what you requested
  useEffect(() => {
    if (isMetronomeAudible) {
      // Fade in quickly to 0dB (Audible)
      volumeGate.current?.volume.rampTo(0, 0.05);
    } else {
      // Fade out to Silence
      volumeGate.current?.volume.rampTo(-Infinity, 0.05);
    }
  }, [isMetronomeAudible]);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const toggleTransport = async () => {
    if (Tone.getContext().state !== 'running') await Tone.start();
    
    if (isPlaying) {
      Tone.getTransport().pause();
      setIsPlaying(false);
    } else {
      Tone.getTransport().start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-10 px-10 py-6 bg-slate-900 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
      
      {/* Master Play/Pause */}
      <button 
        onClick={toggleTransport}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isPlaying ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-green-500 hover:bg-green-400'
        }`}
      >
        {isPlaying ? <div className="w-4 h-4 bg-white rounded-sm" /> : <div className="ml-1 border-y-[8px] border-y-transparent border-l-[12px] border-l-white" />}
      </button>

      {/* BPM Display & Slider */}
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo</span>
        <div className="text-2xl font-black font-mono tracking-tighter">{bpm}</div>
        <input 
          type="range" min="60" max="180" value={bpm} 
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* THE SOUND GATE TOGGLE */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Click</span>
        <button 
          onClick={() => setIsMetronomeAudible(!isMetronomeAudible)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
            isMetronomeAudible 
            ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' 
            : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
        >
          {isMetronomeAudible ? 'AUDIBLE' : 'MUTED'}
        </button>
      </div>

      {/* Pitch Warp Switch */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Warp Engine</span>
        <button 
          onClick={onWarpToggle}
          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
            isWarpEnabled ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-800'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
            isWarpEnabled ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

    </div>
  );
}