"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function SyncedLoop({ loopUrl, loopName }: { loopUrl: string, loopName: string }) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useRef<Tone.Player | null>(null);

  useEffect(() => {
    // 1. Load the file from Django into a Tone.js Player
    player.current = new Tone.Player({
      url: loopUrl,
      loop: true,
      autostart: false,
    }).toDestination();

    return () => { player.current?.dispose(); };
  }, [loopUrl]);

  const toggleLoop = () => {
    if (isPlaying) {
      player.current?.stop();
      setIsPlaying(false);
      setIsQueued(false);
    } else {
      // 2. THE SYNC SECRET: "@1n" 
      // This tells Tone.js: "Don't start now. Start on the next whole Bar (Beat 1)."
      setIsQueued(true);
      player.current?.start("@1n");
      
      // We use a small listener to flip the UI state when it actually starts
      Tone.getTransport().scheduleOnce(() => {
        setIsPlaying(true);
        setIsQueued(false);
      }, "@1n");
    }
  };

  return (
    <button 
      onClick={toggleLoop}
      className={`p-6 rounded-xl border-2 transition-all ${
        isPlaying ? 'border-green-500 bg-green-500/10' : 
        isQueued ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' : 
        'border-slate-700 bg-slate-800'
      }`}
    >
      <span className="text-white font-bold">{loopName}</span>
      <p className="text-[10px] text-slate-400 mt-2">
        {isQueued ? "WAITING FOR BEAT 1..." : isPlaying ? "SYNCED" : "READY"}
      </p>
    </button>
  );
}