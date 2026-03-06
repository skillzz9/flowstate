"use client";
import * as Tone from 'tone';
import { useEffect, useRef } from 'react';

export default function MasterSpectrogram() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyser = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Off-screen canvas to store the "scrolling history"
  const tempCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Initialize Analyser and connect to Master Output
    analyser.current = new Tone.Analyser("fft", 1024);
    Tone.getDestination().connect(analyser.current);

    // Setup off-screen helper
    tempCanvas.current = document.createElement('canvas');

    const renderFrame = () => {
      if (!canvasRef.current || !analyser.current || !tempCanvas.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const tCtx = tempCanvas.current.getContext('2d');
      if (!ctx || !tCtx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Ensure temp canvas matches size
      if (tempCanvas.current.width !== width) {
        tempCanvas.current.width = width;
        tempCanvas.current.height = height;
      }

      const freqData = analyser.current.getValue() as Float32Array;

      // 2. THE SCROLL LOGIC
      // Copy the current canvas image to the temp canvas
      tCtx.drawImage(canvas, 0, 0);

      // Draw the temp canvas back, but shifted 1 pixel to the LEFT
      ctx.drawImage(tempCanvas.current, -1, 0);

      // 3. DRAW THE NEW "COLUMN" ON THE RIGHT EDGE
      for (let i = 0; i < freqData.length; i++) {
        const value = freqData[i]; // dB value
        // Map dB (-100 to 0) to color intensity
        const intensity = Math.max(0, (value + 100) * 2.5); 
        
        // Color mapping: High energy = Orange/Red, Low energy = Purple/Black
        // This mimics the "Heatmap" look in your screenshot
        ctx.fillStyle = `rgb(${intensity * 1.5}, ${intensity * 0.5}, ${intensity * 2})`;
        
        // Draw 1px wide rectangle at the very right edge
        // Y-axis is flipped (low freqs at bottom, high at top)
        const y = height - (i * (height / (freqData.length / 2)));
        ctx.fillRect(width - 1, y, 1, height / freqData.length);
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      analyser.current?.dispose();
    };
  }, []);

  return (
    <div className="w-full bg-black border-b border-white/10 overflow-hidden h-64 relative">
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={256} 
        className="w-full h-full"
      />
      {/* Frequency Labels */}
      <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none">
        <span className="text-[10px] font-mono text-white/40">21.6 kHz</span>
        <span className="text-[10px] font-mono text-white/40">10.8 kHz</span>
        <span className="text-[10px] font-mono text-white/20">440 Hz</span>
      </div>
    </div>
  );
}