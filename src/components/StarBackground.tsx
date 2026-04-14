import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinklePhase: number;
  driftSpeed: number;
}

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let stars: Star[] = [];

    const initStars = () => {
      const density = (canvas.width * canvas.height) / 5500;
      const count = Math.min(Math.floor(density), 180);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.1 + 0.2,
        baseOpacity: Math.random() * 0.25 + 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.018 + 0.004,
      }));
    };

    const resize = () => {
      // Canvas is position:fixed so viewport dimensions are correct —
      // never use scrollHeight here as it recreates stars on every content change.
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Debounce resize so rapid window-resize events don't thrash star creation
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    let time = 0;
    // Track last frame time to cap at ~60fps and avoid overdrive on high-refresh screens
    let lastFrame = 0;
    const FRAME_BUDGET = 1000 / 62; // ~16ms

    const draw = (now: number) => {
      animFrameId = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_BUDGET) return;
      lastFrame = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.006;

      for (const star of stars) {
        const twinkle = Math.sin(time * 0.8 + star.twinklePhase) * 0.12;
        const opacity = Math.max(0, Math.min(0.6, star.baseOpacity + twinkle));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 230, 255, ${opacity})`;
        ctx.fill();

        star.y -= star.driftSpeed;
        if (star.y + star.radius < 0) {
          star.y = canvas.height + star.radius;
          star.x = Math.random() * canvas.width;
        }
      }
    };

    resize();
    animFrameId = requestAnimationFrame(draw);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
};

export default StarBackground;
