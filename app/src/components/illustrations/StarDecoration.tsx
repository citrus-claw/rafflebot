export function StarDecoration({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2" fill="#141414" />
      <circle cx="4" cy="8" r="1" fill="#141414" />
      <circle cx="20" cy="6" r="1.5" fill="#141414" />
      <circle cx="18" cy="18" r="1" fill="#141414" />
    </svg>
  );
}

export function Bunting({ className = '' }: { className?: string }) {
  return (
    <svg width={200} height={40} viewBox="0 0 200 40" fill="none" className={className}>
      <path d="M0 10 L20 30 L40 10 L60 30 L80 10 L100 30 L120 10 L140 30 L160 10 L180 30 L200 10" stroke="#141414" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function FerrisWheel({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Center hub */}
      <circle cx="100" cy="90" r="60" stroke="#141414" strokeWidth="1.5" />
      <circle cx="100" cy="90" r="5" fill="#141414" />
      {/* Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 100 + 60 * Math.cos(rad);
        const y2 = 90 + 60 * Math.sin(rad);
        return <line key={angle} x1="100" y1="90" x2={x2} y2={y2} stroke="#141414" strokeWidth="0.8" />;
      })}
      {/* Gondolas */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 100 + 60 * Math.cos(rad);
        const cy = 90 + 60 * Math.sin(rad);
        return <rect key={angle} x={cx - 5} y={cy - 4} width="10" height="8" rx="2" stroke="#141414" strokeWidth="1" />;
      })}
      {/* Support legs */}
      <line x1="100" y1="90" x2="70" y2="185" stroke="#141414" strokeWidth="1.5" />
      <line x1="100" y1="90" x2="130" y2="185" stroke="#141414" strokeWidth="1.5" />
      <line x1="65" y1="185" x2="135" y2="185" stroke="#141414" strokeWidth="1.5" />
    </svg>
  );
}
