"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function SyncedLoop({ loopUrl, loopName }: { loopUrl: string, loopName: string }) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12); // Default -12dB (Safe starting point)
  
  const player = useRef<Tone.Player | null>(null);
  const volumeNode = useRef<Tone.Volume | null>(null);

  useEffect(() => {
    // 1. Create a Volume Node to control the "Gain"
    volumeNode.current = new Tone.Volume(volume).toDestination();

    // 2. Load Player and connect it to the Volume Node instead of Destination
    player.current = new Tone.Player({
      url: loopUrl,
      loop: true,
      autostart: false,
    }).connect(volumeNode.current);

    return () => {
      player.current?.dispose();
      volumeNode.current?.dispose();
    };
  }, [loopUrl]);

  // Handle Volume Slider Changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (volumeNode.current) {
      // Smoothly ramp the volume to avoid "clicks"
      volumeNode.current.volume.rampTo(newVol, 0.1);
    }
  };

  const toggleLoop = () => {
    if (isPlaying) {
      player.current?.stop();
      setIsPlaying(false);
      setIsQueued(false);
    } else {
      setIsQueued(true);
      player.current?.start("@1n");
      
      Tone.getTransport().scheduleOnce(() => {
        setIsPlaying(true);
        setIsQueued(false);
      }, "@1n");
    }
  };

  return (
    <div className="flex flex-col gap-3 group">
      {/* The Main Action Card */}
      <button 
        onClick={toggleLoop}
        className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start justify-between h-32 ${
          isPlaying ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 
          isQueued ? 'border-yellow-400 bg-yellow-400/5 animate-pulse' : 
          'border-slate-800 bg-slate-900/50 hover:border-slate-600'
        }`}
      >
        <span className={`font-bold text-lg ${isPlaying ? 'text-blue-400' : 'text-slate-300'}`}>
          {loopName}
        </span>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-500 animate-ping' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            {isQueued ? "Syncing..." : isPlaying ? "Active" : "Ready"}
          </span>
        </div>
      </button>

      {/* The Slick Horizontal Slider */}
      <div className="px-2 flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
          <span>Gain</span>
          <span>{volume === -60 ? 'MUTE' : `${volume}dB`}</span>
        </div>
        <input 
          type="range" 
          min="-60" 
          max="0" 
          step="1"
          value={volume} 
          onChange={handleVolumeChange}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
        />
      </div>
    </div>
  );
}