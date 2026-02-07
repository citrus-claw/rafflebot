export function TentIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Main tent shape */}
      <path d="M100 30 L170 150 H30 Z" stroke="#141414" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Tent flap lines */}
      <line x1="100" y1="30" x2="65" y2="150" stroke="#141414" strokeWidth="0.8" strokeDasharray="4 3" />
      <line x1="100" y1="30" x2="135" y2="150" stroke="#141414" strokeWidth="0.8" strokeDasharray="4 3" />
      {/* Entrance */}
      <path d="M85 150 Q100 110 115 150" stroke="#141414" strokeWidth="1.5" fill="none" />
      {/* Flag on top */}
      <line x1="100" y1="30" x2="100" y2="15" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M100 15 L115 20 L100 25" stroke="#141414" strokeWidth="1.2" fill="none" />
      {/* Ground line */}
      <line x1="20" y1="150" x2="180" y2="150" stroke="#141414" strokeWidth="0.8" strokeDasharray="4 3" />
      {/* Bunting */}
      <path d="M40 60 L55 75 L70 60 L85 75 L100 60 L115 75 L130 60 L145 75 L160 60" stroke="#141414" strokeWidth="1" fill="none" />
      {/* Stars */}
      <circle cx="25" cy="40" r="1.5" fill="#141414" />
      <circle cx="175" cy="45" r="1.5" fill="#141414" />
    </svg>
  );
}
