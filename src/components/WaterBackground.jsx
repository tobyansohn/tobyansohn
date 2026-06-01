import { useEffect, useRef } from "react";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rgba  = ([r, g, b], a) => `rgba(${r},${g},${b},${a.toFixed(4)})`;
const rand  = (lo, hi) => lo + Math.random() * (hi - lo);

export default function WaterBackground({ dark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
    let W = 0, H = 0, ctx;

    function initCanvas() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
      ctx.scale(dpr, dpr);
    }
    initCanvas();

    const C = dark ? {
      ripple: [232, 178, 87],
      large:  [210, 185, 148],
      small:  [240, 220, 190],
    } : {
      ripple: [107,  79,  42],
      large:  [150, 125,  90],
      small:  [120,  95,  60],
    };

    // ── Large cloud blobs: slow, wandering, high contrast centers ──
    function makeLarge() {
      return {
        x:    rand(0.05, 0.95) * W,
        y:    rand(0.05, 0.95) * H,
        rx:   rand(0.12, 0.28) * W,
        ry:   rand(0.10, 0.22) * H,
        // Two-axis orbit with independent frequencies for lissajous-like wander
        orX:  rand(0.04, 0.10) * W,
        orY:  rand(0.03, 0.08) * H,
        spdX: rand(0.04, 0.09) * (Math.random() < 0.5 ? 1 : -1),
        spdY: rand(0.03, 0.07) * (Math.random() < 0.5 ? 1 : -1),
        ph:   rand(0, Math.PI * 2),
        alpha: dark ? rand(0.045, 0.085) : rand(0.055, 0.10),
      };
    }

    // ── Small accent blobs: faster, tighter, scattered ──
    function makeSmall() {
      return {
        x:    rand(0.02, 0.98) * W,
        y:    rand(0.02, 0.98) * H,
        rx:   rand(0.03, 0.09) * W,
        ry:   rand(0.03, 0.07) * H,
        orX:  rand(0.02, 0.06) * W,
        orY:  rand(0.02, 0.05) * H,
        spdX: rand(0.08, 0.18) * (Math.random() < 0.5 ? 1 : -1),
        spdY: rand(0.06, 0.14) * (Math.random() < 0.5 ? 1 : -1),
        ph:   rand(0, Math.PI * 2),
        alpha: dark ? rand(0.025, 0.05) : rand(0.03, 0.06),
      };
    }

    const largeBlobs = Array.from({ length: 6 },  makeLarge);
    const smallBlobs = Array.from({ length: 10 }, makeSmall);

    // ── Wave groups: sets of sine-curve crests that travel across the surface ──
    // Each group has a base Y, direction, and 4 crests spaced behind it
    function makeGroup(i, n) {
      return {
        baseY:  rand(0.05, 0.95) * H,
        dir:    Math.random() < 0.5 ? 1 : -1,
        speed:  rand(0.055, 0.12),
        freq:   rand(0.004, 0.009),   // spatial frequency
        freq2:  rand(0.008, 0.016),   // second harmonic for shape complexity
        amp:    rand(10, 22),
        amp2:   rand(3, 8),
        crests: 4,
        spacing: rand(28, 48),
        ph:     rand(0, Math.PI * 2),
        alpha:  dark ? rand(0.045, 0.08) : rand(0.055, 0.09),
      };
    }
    const waveGroups = Array.from({ length: 6 }, makeGroup);

    function drawWaveGroup(g, t) {
      const phase = t * g.speed * g.dir + g.ph;
      for (let c = 0; c < g.crests; c++) {
        const yBase  = g.baseY + c * g.spacing;
        const falloff = 1 - c / g.crests * 0.45;
        const alpha  = g.alpha * falloff;

        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
          const y = yBase
            + Math.sin(x * g.freq  + phase)        * g.amp
            + Math.sin(x * g.freq2 + phase * 1.37) * g.amp2
            + Math.sin(x * g.freq  * 0.5 + phase * 0.6) * g.amp * 0.25;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(C.ripple, alpha);
        ctx.lineWidth   = Math.max(0.4, (1 - c / g.crests) * 1.4);
        ctx.stroke();
      }
    }

    function drawBlob(b, t, color) {
      const bx = b.x + Math.cos(t * b.spdX + b.ph) * b.orX;
      const by = b.y + Math.sin(t * b.spdY + b.ph * 1.3) * b.orY;

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(1, b.ry / b.rx);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.rx);
      g.addColorStop(0,    rgba(color, b.alpha));
      g.addColorStop(0.4,  rgba(color, b.alpha * 0.55));
      g.addColorStop(0.75, rgba(color, b.alpha * 0.15));
      g.addColorStop(1,    rgba(color, 0));

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, b.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let rafId = null, prevT = null;
    let onscreen = true;

    function draw(now) {
      const dt = prevT ? clamp((now - prevT) / 1000, 0, 0.05) : 0.016;
      prevT = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, W, H);

      for (const b of largeBlobs) drawBlob(b, t, C.large);
      for (const b of smallBlobs) drawBlob(b, t, C.small);
      for (const g of waveGroups) drawWaveGroup(g, t);

      if (onscreen) rafId = requestAnimationFrame(draw);
      else rafId = null;
    }

    function start() {
      if (rafId == null) { prevT = null; rafId = requestAnimationFrame(draw); }
    }
    function stop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

    // Only animate while the canvas (or page tab) is actually visible.
    const io = new IntersectionObserver(([e]) => {
      onscreen = e.isIntersecting && !document.hidden;
      if (onscreen) start(); else stop();
    }, { threshold: 0 });
    io.observe(canvas);
    const onVis = () => {
      if (document.hidden) stop();
      else if (onscreen) start();
    };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(() => {
      initCanvas();
      // Rescatter so blobs stay proportional after resize
      largeBlobs.forEach(b  => { b.x = rand(0.05, 0.95) * W; b.y = rand(0.05, 0.95) * H; });
      smallBlobs.forEach(b  => { b.x = rand(0.02, 0.98) * W; b.y = rand(0.02, 0.98) * H; });
      waveGroups.forEach(g  => { g.baseY = rand(0.05, 0.95) * H; });
    });
    ro.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
