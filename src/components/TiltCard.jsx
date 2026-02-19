import React, { useRef, useCallback } from 'react';

/**
 * TiltCard — 3D perspective tilt effect on hover
 * Wraps any card content with a subtle parallax tilt that follows the mouse.
 */
export default function TiltCard({ children, className = '', style = {}, maxTilt = 6, glare = true, ...props }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = ((centerY - y) / centerY) * maxTilt;

    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

    if (glare) {
      const glareEl = el.querySelector('.tilt-glare');
      if (glareEl) {
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
        const intensity = Math.min(0.15, Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / rect.width * 0.3);
        glareEl.style.background = `linear-gradient(${angle}deg, rgba(0, 208, 156, ${intensity}), transparent 60%)`;
        glareEl.style.opacity = '1';
      }
    }
  }, [maxTilt, glare]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    const glareEl = el.querySelector('.tilt-glare');
    if (glareEl) glareEl.style.opacity = '0';
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={{
        ...style,
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {glare && (
        <div className="tilt-glare" style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none', opacity: 0,
          transition: 'opacity 300ms',
        }} />
      )}
    </div>
  );
}
