"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  r: number; g: number; b: number;
}

const PALETTE = [
  [0, 212, 255],    // cyan
  [139, 92, 246],   // violet
  [236, 72, 153],   // pink
  [16, 185, 129],   // emerald
  [245, 158, 11],   // amber
] as [number, number, number][];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const make = (): Particle => {
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05,
        life: 0,
        maxLife: 250 + Math.random() * 350,
        size: Math.random() * 1.6 + 0.4,
        r, g, b,
      };
    };

    // Pre-seed at random life
    for (let i = 0; i < 70; i++) {
      const p = make();
      p.life = Math.random() * p.maxLife;
      particles.current.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;

      // Connections (only between same-palette-family — skip for perf, just use max 50 pair checks)
      const limit = Math.min(ps.length, 50);
      for (let i = 0; i < limit; i++) {
        for (let j = i + 1; j < limit; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14400) { // 120^2
            const alpha = (1 - Math.sqrt(d2) / 120) * 0.06;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        const t = p.life / p.maxLife;
        const alpha = t < 0.12 ? (t / 0.12) * 0.55 : t > 0.88 ? ((1 - t) / 0.12) * 0.55 : 0.55;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.fill();

        if (p.life >= p.maxLife) ps[i] = make();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.55 }}
    />
  );
}
