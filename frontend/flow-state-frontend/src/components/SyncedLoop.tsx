"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function SyncedLoop({ loopUrl, loopName }: { loopUrl: string, loopName: string }) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12);
  
  // Use GrainPlayer for time-stretching without pitch shift
  const player = useRef<Tone.GrainPlayer | null>(null);
  const volumeNode = useRef<Tone.Volume | null>(null);

  useEffect(() => {
    volumeNode.current = new Tone.Volume(volume).toDestination();

    // 1. Initialize GrainPlayer
    player.current = new Tone.GrainPlayer({
      url: loopUrl,
      loop: true,
      grainSize: 0.1, // Smaller grains = smoother stretching
      overlap: 0.05,
    }).connect(volumeNode.current);

    // 2. Initial BPM Sync
    const currentBpm = Tone.getTransport().bpm.value;
    player.current.playbackRate = currentBpm / 90; 

    return () => {
      player.current?.dispose();
      volumeNode.current?.dispose();
    };
  }, [loopUrl]);

  // 3. LISTEN FOR MASTER BPM CHANGES
  useEffect(() => {
    // We create a loop that checks the master BPM and updates the player rate
    const syncInterval = setInterval(() => {
      if (player.current && player.current.loaded) {
        const masterBpm = Tone.getTransport().bpm.value;
        // Dynamically update playback rate: Master / Original (90)
        player.current.playbackRate = masterBpm / 90;
      }
    }, 100); // Check every 100ms for slider movements

    return () => clearInterval(syncInterval);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    volumeNode.current?.volume.rampTo(newVol, 0.1);
  };

  const toggleLoop = () => {
    if (isPlaying) {
      player.current?.stop();
      setIsPlaying(false);
      setIsQueued(false);
    } else {
      setIsQueued(true);
      // Start on next Bar
      player.current?.start("@1n");
      
      Tone.getTransport().scheduleOnce(() => {
        setIsPlaying(true);
        setIsQueued(false);
      }, "@1n");
    }
  };

  return (
    <div className="flex flex-col gap-3 group relative">
      <button 
        onClick={toggleLoop}
        className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start justify-between h-32 ${
          isPlaying ? 'border-purple-500 bg-purple-500/10' : 
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
            {isPlaying ? "Warped & Synced" : "90 BPM Ready"}
          </span>
        </div>
      </button>

      <div className="px-2 flex flex-col gap-1">
        <input 
          type="range" min="-60" max="0" value={volume} 
          onChange={handleVolumeChange}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
}