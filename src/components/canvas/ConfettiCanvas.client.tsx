import { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  "#e53e3e", // pomodoro
  "#38a169", // basilico
  "#ecc94b", // formaggio
  "#dd6b20", // crosta
  "#f7fafc", // mozzarella
];

const PARTICLE_COUNT = 90;
const DURATION_MS = 3000;
const FADE_START_MS = 2500;

const createConfettiParticle = (
  cx: number,
  cy: number
): ConfettiParticle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 7;
  return {
    x: cx,
    y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    size: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    opacity: 1,
  };
};

interface ConfettiCanvasProps {
  trigger: boolean;
  onComplete: () => void;
}

export const ConfettiCanvas = ({ trigger, onComplete }: ConfettiCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles: ConfettiParticle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => createConfettiParticle(cx, cy)
    );

    let animId: number;
    const startTime = performance.now();
    const gravity = 0.15;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed > DURATION_MS) {
        cancelAnimationFrame(animId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeProgress =
        elapsed > FADE_START_MS
          ? 1 - (elapsed - FADE_START_MS) / (DURATION_MS - FADE_START_MS)
          : 1;

      for (const p of particles) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity = fadeProgress;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
};
