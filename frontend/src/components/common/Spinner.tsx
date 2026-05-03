// ============================================================
// Spinner Component — Ashoka Chakra–inspired circular loader
// ============================================================

import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading...' }: SpinnerProps) {
  return (
    <div
      className={`spinner spinner--${size}`}
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="spinner__ring" aria-hidden="true">
        {/* 24 spokes like the Ashoka Chakra */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="spinner__spoke"
            style={{ transform: `rotate(${i * 15}deg)` }}
          />
        ))}
      </div>
      {label && <p className="spinner__label">{label}</p>}
    </div>
  );
}
