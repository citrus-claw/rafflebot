export function RaffleDrum({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Drum body */}
      <ellipse cx="100" cy="140" rx="65" ry="20" stroke="#141414" strokeWidth="1.8" />
      <ellipse cx="100" cy="80" rx="65" ry="20" stroke="#141414" strokeWidth="1.8" />
      <line x1="35" y1="80" x2="35" y2="140" stroke="#141414" strokeWidth="1.8" />
      <line x1="165" y1="80" x2="165" y2="140" stroke="#141414" strokeWidth="1.8" />
      {/* Horizontal bands */}
      <ellipse cx="100" cy="100" rx="65" ry="18" stroke="#141414" strokeWidth="0.8" strokeDasharray="4 3" />
      <ellipse cx="100" cy="120" rx="65" ry="19" stroke="#141414" strokeWidth="0.8" strokeDasharray="4 3" />
      {/* Handle/crank */}
      <line x1="165" y1="110" x2="185" y2="95" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="188" cy="92" r="5" stroke="#141414" strokeWidth="1.8" />
      {/* Legs */}
      <line x1="55" y1="140" x2="45" y2="175" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="145" y1="140" x2="155" y2="175" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="40" y1="175" x2="50" y2="175" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="150" y1="175" x2="160" y2="175" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tickets flying out */}
      <rect x="80" y="55" width="14" height="10" rx="1" stroke="#141414" strokeWidth="1.2" transform="rotate(-15 87 60)" />
      <rect x="105" y="48" width="14" height="10" rx="1" stroke="#141414" strokeWidth="1.2" transform="rotate(10 112 53)" />
      <rect x="115" y="60" width="14" height="10" rx="1" stroke="#141414" strokeWidth="1.2" transform="rotate(25 122 65)" />
      {/* Stars */}
      <circle cx="75" cy="40" r="2" fill="#141414" />
      <circle cx="130" cy="35" r="1.5" fill="#141414" />
      <circle cx="95" cy="30" r="1" fill="#141414" />
    </svg>
  );
}
