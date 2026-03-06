"use client";
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export default function SyncedLoop({ loopUrl, loopName }: { loopUrl: string, loopName: string }) {
  const [isQueued, setIsQueued] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12);
  
  const player = useRef<Tone.Player | null>(null);
  const volumeNode = useRef<Tone.Volume | null>(null);
  const analyser = useRef<Tone.Analyser | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Setup Audio Nodes
    analyser.current = new Tone.Analyser("fft", 64); // Small FFT size for a "cleaner" look
    volumeNode.current = new Tone.Volume(volume).toDestination();
    
    player.current = new Tone.Player({
      url: loopUrl,
      loop: true,
    }).connect(analyser.current).connect(volumeNode.current);

    return () => {
      player.current?.dispose();
      volumeNode.current?.dispose();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loopUrl]);

  // 2. The Spectrogram Drawing Loop
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyser.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = () => {
      const values = analyser.current!.getValue() as Float32Array;
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / values.length;

      ctx.clearRect(0, 0, width, height);

      // Draw the Bars
      values.forEach((v, i) => {
        // Convert dB values (-100 to 0) to a positive height
        const dbValue = Math.abs(v);
        const barHeight = Math.max(0, height - (dbValue * 2)); 
        
        ctx.fillStyle = `rgba(59, 130, 246, 0.5)`; // blue-500 at 50% opacity
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
      });

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying]);

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
          isPlaying ? 'border-blue-500 bg-blue-500/5' : 
          isQueued ? 'border-yellow-400 bg-yellow-400/5 animate-pulse' : 
          'border-slate-800 bg-slate-900/50 hover:border-slate-600'
        }`}
      >
        {/* THE SPECTROGRAM BACKGROUND */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          width={300} // Fixed resolution for consistent look
          height={128}
        />

        {/* CONTENT LAYER (Above Canvas) */}
        <span className={`relative z-10 font-bold text-lg ${isPlaying ? 'text-blue-400' : 'text-slate-300'}`}>
          {loopName}
        </span>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-500 animate-ping' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            {isQueued ? "Syncing..." : isPlaying ? "Active" : "Ready"}
          </span>
        </div>
      </button>

      {/* VOLUME SLIDER */}
      <div className="px-2 flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
          <span>Gain</span>
          <span>{volume === -60 ? 'MUTE' : `${volume}dB`}</span>
        </div>
        <input 
          type="range" min="-60" max="0" step="1" value={volume} 
          onChange={handleVolumeChange}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}