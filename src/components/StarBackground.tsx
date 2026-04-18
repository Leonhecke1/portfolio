import { useEffect, useRef } from 'react';
import { useVisualMode } from '../contexts/VisualModeContext';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinklePhase: number;
  driftSpeed: number;
  hue: number; // 0 = white, 1 = blue-tinted, 2 = purple-tinted (enhanced only)
}

const StarBackground = () => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const enhancedRef  = useRef(false);
  const { enhanced } = useVisualMode();

  // Keep a ref in sync so the draw loop always reads the latest value
  useEffect(() => {
    enhancedRef.current = enhanced;
  }, [enhanced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let stars: Star[] = [];

    const initStars = (enh: boolean) => {
      const density  = (canvas.width * canvas.height) / (enh ? 3800 : 5500);
      const count    = Math.min(Math.floor(density), enh ? 320 : 180);
      stars = Array.from({ length: count }, (_, i) => ({
        x:            Math.random() * canvas.width,
        y:            Math.random() * canvas.height,
        radius:       Math.random() * (enh ? 1.35 : 1.1) + 0.2,
        baseOpacity:  Math.random() * (enh ? 0.38 : 0.25) + (enh ? 0.07 : 0.05),
        twinklePhase: Math.random() * Math.PI * 2,
        driftSpeed:   Math.random() * 0.018 + 0.004,
        hue:          enh ? (i % 5 === 0 ? 1 : i % 7 === 0 ? 2 : 0) : 0,
      }));
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(enhancedRef.current);
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    let time       = 0;
    let lastFrame  = 0;
    const FRAME_BUDGET = 1000 / 62;

    const draw = (now: number) => {
      animFrameId = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_BUDGET) return;
      lastFrame = now;

      const enh = enhancedRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.006;

      for (const star of stars) {
        const twinkle  = Math.sin(time * 0.8 + star.twinklePhase) * (enh ? 0.18 : 0.12);
        const opacity  = Math.max(0, Math.min(enh ? 0.85 : 0.6, star.baseOpacity + twinkle));

        let color: string;
        if (enh && star.hue === 1) {
          color = `rgba(147, 197, 253, ${opacity})`; // blue-tinted
        } else if (enh && star.hue === 2) {
          color = `rgba(196, 181, 253, ${opacity})`; // purple-tinted
        } else {
          color = `rgba(210, 230, 255, ${opacity})`;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Add subtle glow to large stars in enhanced mode
        if (enh && star.radius > 1.0 && star.hue !== 0) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2.5);
          gradient.addColorStop(0, star.hue === 1
            ? `rgba(147,197,253,${opacity * 0.18})`
            : `rgba(196,181,253,${opacity * 0.18})`
          );
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-init stars when enhanced changes (different density/color mix)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const density = (canvas.width * canvas.height) / (enhanced ? 3800 : 5500);
    const count   = Math.min(Math.floor(density), enhanced ? 320 : 180);
    // Trigger a soft re-init by dispatching resize (cheap, already debounced)
    if (Math.abs(count - 180) > 20) {
      window.dispatchEvent(new Event('resize'));
    }
  }, [enhanced]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
        transition: 'opacity 0.8s ease',
      }}
      aria-hidden="true"
    />
  );
};

export default StarBackground;
