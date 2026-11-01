'use client';

import { useEffect, useRef } from 'react';

// Background: messy raw values drift right, cross the "dbt run" line, and come out clean.
// The pointer shoves tokens out of its way.

const RAW = ['NULL', '"N/A"', '{"id":"1"}', '1,,3', '🦆', 'NaN', '" bob "', '2026-13-45', '-0', 'undefined', '\\N', '¯\\_(ツ)_/¯', 'TODO'];
const CLEAN = ['id INT', '✓', '42', "'Bob'", '2026-01-15', '0', 'row ✔', 'ok', 'UTC', 'NOT NULL', 'tested'];

type Tok = { x: number; y: number; v: number; raw: string; clean: string; size: number };

const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];

export function DataFlow({ chaos, party }: { chaos: boolean; party: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fx = useRef({ chaos, party });

  useEffect(() => {
    fx.current = { chaos, party };
  }, [chaos, party]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const family = getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'monospace';
    const mouse = { x: -999, y: -999 };
    let w = 0;
    let h = 0;
    let toks: Tok[] = [];

    const spawn = (x: number): Tok => ({
      x,
      y: Math.random() * h,
      v: 18 + Math.random() * 46,
      raw: pick(RAW),
      clean: pick(CLEAN),
      size: 10 + Math.random() * 7,
    });

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      toks = Array.from({ length: Math.round((w * h) / 13000) }, () => spawn(Math.random() * w));
    };

    let last = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { chaos, party } = fx.current;
      const mid = w * 0.5;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = chaos ? 'rgba(255,42,42,.3)' : 'rgba(198,255,0,.14)';
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.moveTo(mid, 0);
      ctx.lineTo(mid, h);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const t of toks) {
        t.x += t.v * dt * (chaos ? 5 : party ? 2.5 : 1);
        const dx = t.x - mouse.x;
        const dy = t.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 110) t.y += (dy / (d + 1)) * (110 - d) * dt * 6;
        if (t.x > w + 80) Object.assign(t, spawn(-120));
        const clean = t.x > mid;
        const jx = chaos ? (Math.random() - 0.5) * 8 : 0;
        const jy = chaos ? (Math.random() - 0.5) * 8 : 0;
        ctx.font = `${clean ? 700 : 400} ${t.size}px ${family}`;
        ctx.fillStyle = chaos
          ? 'rgba(255,42,42,.6)'
          : party
            ? `hsla(${(t.x * 0.6 + now * 0.15) % 360}, 100%, 62%, .7)`
            : clean
              ? 'rgba(0,240,255,.34)'
              : 'rgba(255,61,129,.3)';
        ctx.fillText(clean ? t.clean : t.raw, t.x + jx, t.y + jy);
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="fun-flow" aria-hidden />;
}
