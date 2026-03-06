"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function SyncedLoop({ 
  loopUrl, 
  loopName, 
  isWarpEnabled 
}: { 
  loopUrl: string, 
  loopName: string, 
  isWarpEnabled: boolean 
}) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12);
  
  const player = useRef<Tone.GrainPlayer | null>(null);
  const volumeNode = useRef<Tone.Volume | null>(null);

  useEffect(() => {
    // 1. Setup Audio Engine with the previous high-quality volume control
    volumeNode.current = new Tone.Volume(volume).toDestination();

    player.current = new Tone.GrainPlayer({
      url: loopUrl,
      loop: true,
      grainSize: 0.1,
      overlap: 0.05,
    }).connect(volumeNode.current);

    return () => {
      player.current?.dispose();
      volumeNode.current?.dispose();
    };
  }, [loopUrl]);

  // 2. THE MASTER WARP SYNC (Keeps your D Minor loops in check)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (player.current && player.current.loaded) {
        const masterBpm = Tone.getTransport().bpm.value;
        const playbackRatio = masterBpm / 90; // All loops are natively 90 BPM
        
        player.current.playbackRate = playbackRatio;

        if (isWarpEnabled) {
          // TAPE MODE: Pitch shifts with speed (Deeper when slowed)
          const detuneValue = 1200 * Math.log2(playbackRatio);
          player.current.detune = detuneValue;
        } else {
          // FIXED MODE: Pitch stays locked in D Minor
          player.current.detune = 0;
        }
      }
    }, 100); 

    return () => clearInterval(syncInterval);
  }, [isWarpEnabled]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (volumeNode.current) {
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
    <div className="flex flex-col gap-3 group relative w-full">
      {/* RESTORED: Full-card Action Button */}
      <button 
        onClick={toggleLoop}
        className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start justify-between h-32 w-full ${
          isPlaying ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 
          isQueued ? 'border-yellow-400 bg-yellow-400/5 animate-pulse' : 
          'border-slate-800 bg-slate-900/50 hover:border-slate-600'
        }`}
      >
        <span className={`font-bold text-lg ${isPlaying ? 'text-purple-400' : 'text-slate-300'}`}>
          {loopName}
        </span>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-purple-500 animate-ping' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            {isQueued ? "Syncing..." : isPlaying ? (isWarpEnabled ? "Tape Drift" : "Pitch Locked") : "90 BPM Ready"}
          </span>
        </div>
      </button>

      {/* RESTORED: Slick Horizontal Slider */}
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
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
        />
      </div>
    </div>
  );
}