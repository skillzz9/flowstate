"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

interface SyncedLoopProps {
  loopUrl: string;
  loopName: string;
  isWarpEnabled: boolean;
  originalBpm: number;
}

export default function SyncedLoop({ 
  loopUrl, 
  loopName, 
  isWarpEnabled, 
  originalBpm 
}: SyncedLoopProps) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12);
  const [progress, setProgress] = useState(0);
  
  const player = useRef<Tone.GrainPlayer | null>(null);
  const volumeNode = useRef<Tone.Volume | null>(null);
  const requestRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0); 

  useEffect(() => {
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
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loopUrl]);

  // ANIMATION: Calculating position based on the exact audio start time
  const animate = () => {
    if (player.current && player.current.loaded && isPlaying) {
      const bufferDuration = player.current.buffer.duration;
      const playbackRate = player.current.playbackRate;
      const effectiveDuration = bufferDuration / playbackRate;

      // Use Tone.now() for high-precision comparison against the offset
      const currentTime = Tone.now();
      const relativeTime = currentTime - offsetRef.current;
      
      const loopPos = (relativeTime % effectiveDuration) / effectiveDuration;
      setProgress(loopPos * 100);
    } else {
      setProgress(0);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (player.current && player.current.loaded) {
        const masterBpm = Tone.getTransport().bpm.value;
        const playbackRatio = masterBpm / (originalBpm || 90); 
        player.current.playbackRate = playbackRatio;
        player.current.detune = isWarpEnabled ? 1200 * Math.log2(playbackRatio) : 0;
      }
    }, 100); 
    return () => clearInterval(syncInterval);
  }, [isWarpEnabled, originalBpm]);

  const toggleLoop = () => {
    if (isPlaying) {
      player.current?.stop("@1n");
      setIsPlaying(false);
      setIsQueued(false);
      offsetRef.current = 0;
    } else {
      setIsQueued(true);
      
      // We schedule the audio and the UI anchor at the exact same 'time'
      player.current?.start("@1n");
      
      Tone.getTransport().scheduleOnce((time) => {
        // 'time' is the exact moment the audio engine hits the first sample
        offsetRef.current = time; 
        
        setIsPlaying(true);
        setIsQueued(false);
      }, "@1n");
    }
  };

  return (
    <div className="flex flex-col gap-3 group relative w-full">
      <button 
        onClick={toggleLoop}
        className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start justify-between h-32 w-full ${
          isPlaying ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 
          isQueued ? 'border-yellow-400 bg-yellow-400/5 animate-pulse' : 
          'border-slate-800 bg-slate-900/50 hover:border-slate-600'
        }`}
      >
        {/* THE VISUAL BAR - Perfectly Synced */}
        {isPlaying && (
          <div 
            className="absolute bottom-0 left-0 h-[100px] bg-gradient-to-t from-purple-500/40 to-transparent pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="flex justify-between w-full items-start z-10">
          <span className={`font-bold text-lg ${isPlaying ? 'text-purple-400' : 'text-slate-300'}`}>
            {loopName}
          </span>
          <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-white/5">
            {originalBpm} BPM
          </span>
        </div>
        
        <div className="flex items-center gap-2 z-10">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-purple-500 animate-ping' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            {isQueued ? "Syncing..." : isPlaying ? (isWarpEnabled ? "Tape Mode" : "Locked") : "Standby"}
          </span>
        </div>
      </button>

      {/* VOLUME SLIDER */}
      <div className="px-2 flex flex-col gap-1">
        <input 
          type="range" min="-60" max="0" step="1" value={volume} 
          onChange={(e) => {
            const val = Number(e.target.value);
            setVolume(val);
            volumeNode.current?.volume.rampTo(val, 0.1);
          }}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
}