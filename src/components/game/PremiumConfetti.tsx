"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const GOLD_SILVER_COPPER = ["#f2c14e", "#cfd6e0", "#d99866", "#fff6d6"];

function sizeCanvasToViewport(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Two-layer confetti: a crisp background burst and a blurred "bokeh"
 * foreground layer, to fake a shallow depth of field like a real camera.
 *
 * We size the canvases ourselves and pass `resize: false` to
 * canvas-confetti: its own resize handler calls `getBoundingClientRect` in a
 * way that can throw once the canvas is detached (e.g. navigating away
 * mid-animation), so we own the lifecycle instead.
 */
export function PremiumConfetti({ trigger }: { trigger: number }) {
  const sharpCanvasRef = useRef<HTMLCanvasElement>(null);
  const bokehCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const sharpCanvas = sharpCanvasRef.current;
    const bokehCanvas = bokehCanvasRef.current;
    if (!sharpCanvas || !bokehCanvas) return;

    sizeCanvasToViewport(sharpCanvas);
    sizeCanvasToViewport(bokehCanvas);
    const handleResize = () => {
      sizeCanvasToViewport(sharpCanvas);
      sizeCanvasToViewport(bokehCanvas);
    };
    window.addEventListener("resize", handleResize);

    let cancelled = false;
    let frameId: number;

    // useWorker: true calls canvas.transferControlToOffscreen(), which
    // permanently forbids resizing that canvas from the main thread again.
    // Combined with React StrictMode's double effect invocation in dev (and
    // our own resize handling), that throws on the second pass — so we
    // render without a worker instead.
    const sharpConfetti = confetti.create(sharpCanvas, { resize: false, useWorker: false });
    const bokehConfetti = confetti.create(bokehCanvas, { resize: false, useWorker: false });

    const duration = 3200;
    const end = Date.now() + duration;

    (function frame() {
      if (cancelled) return;
      sharpConfetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.2 },
        colors: GOLD_SILVER_COPPER,
        scalar: 1,
        gravity: 0.9,
      });
      sharpConfetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.2 },
        colors: GOLD_SILVER_COPPER,
        scalar: 1,
        gravity: 0.9,
      });
      bokehConfetti({
        particleCount: 2,
        angle: 90,
        spread: 100,
        origin: { x: Math.random(), y: -0.1 },
        colors: GOLD_SILVER_COPPER,
        scalar: 2.2,
        gravity: 0.55,
        drift: (Math.random() - 0.5) * 1.2,
      });

      if (Date.now() < end) frameId = requestAnimationFrame(frame);
    })();

    sharpConfetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.4 },
      colors: GOLD_SILVER_COPPER,
    });

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      sharpConfetti.reset();
      bokehConfetti.reset();
    };
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <canvas ref={sharpCanvasRef} className="absolute inset-0 w-full h-full" />
      <canvas
        ref={bokehCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(6px)", opacity: 0.8 }}
      />
    </div>
  );
}
