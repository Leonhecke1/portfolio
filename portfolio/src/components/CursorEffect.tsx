import React, { useEffect, useRef } from 'react';

const CursorEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createSparkle = (x: number, y: number) => {
      if (!containerRef.current) return;

      const sparkle = document.createElement('div');
      sparkle.className = 'cursor-sparkle';
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      containerRef.current.appendChild(sparkle);

      // Randomize initial size and color slightly
      const size = Math.random() * 8 + 4; // 4 to 12px
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.backgroundColor = `hsl(${Math.random() * 30 + 30}, 100%, 70%)`; // Orange-yellow hues

      // Randomize animation duration and delay
      const duration = Math.random() * 0.8 + 0.4; // 0.4 to 1.2s
      sparkle.style.animationDuration = `${duration}s`;
      sparkle.style.animationDelay = `${Math.random() * 0.2}s`;

      sparkle.onanimationend = () => {
        sparkle.remove();
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      createSparkle(event.clientX, event.clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div ref={containerRef} className="cursor-effect-container" />;
};

export default CursorEffect;
