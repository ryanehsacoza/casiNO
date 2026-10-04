import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  density?: 'off' | 'low' | 'high';
  isCelebrating?: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  isCoin?: boolean;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ density = 'high', isCelebrating = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (density === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const maxParticles = density === 'high' ? (isCelebrating ? 150 : 60) : 25;
    const particles: Particle[] = [];

    const colors = ['#f59e0b', '#eab308', '#ec4899', '#3b82f6', '#10b981', '#a855f7'];

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.8 - 0.2,
        alpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        isCoin: isCelebrating && Math.random() > 0.5,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0 || p.life > p.maxLife) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.life = 0;
          p.vy = -Math.random() * 0.8 - 0.2;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);

        if (p.isCoin) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#fef08a';
          ctx.fill();

          // Inner metallic ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, isCelebrating]);

  if (density === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
