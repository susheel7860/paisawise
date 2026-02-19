import React from 'react';

export default function HealthScoreGauge({ score, label, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s >= 75) return '#00E676';
    if (s >= 55) return '#00bcd4';
    if (s >= 35) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(score);

  return (
    <div className="health-score-gauge" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `blur(6px)`,
            opacity: 0.5
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.25,
          fontWeight: 700,
          color: color,
          lineHeight: 1
        }}>
          {score}
        </div>
        <div style={{
          fontSize: size * 0.07,
          color: 'var(--text-muted)',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {label || 'Health Score'}
        </div>
      </div>
    </div>
  );
}
