import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isRecording: boolean;
  audioService: any;
  color?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isRecording, audioService, color = '#00f3ff' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw idle circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, 2 * Math.PI);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const dataArray = audioService.getWaveformData();
      if (!dataArray || dataArray.length === 0) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      ctx.beginPath();
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        // Scale value to avoid excessive spikes
        const barHeight = (val / 255) * 50; 
        
        const rad = (i / dataArray.length) * 2 * Math.PI;
        
        // Circular waveform coordinates
        const x1 = centerX + Math.cos(rad) * radius;
        const y1 = centerY + Math.sin(rad) * radius;
        const x2 = centerX + Math.cos(rad) * (radius + barHeight);
        const y2 = centerY + Math.sin(rad) * (radius + barHeight);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioService, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
  );
};

export default Visualizer;