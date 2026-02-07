export function TentIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Tent body */}
      <path d="M10 70 L40 12 L70 70 Z" stroke="#2A2A2A" strokeWidth="2.5" fill="#FEFDFB" />
      {/* Red stripes */}
      <path d="M40 12 L25 70" stroke="#C41E3A" strokeWidth="3" opacity="0.6" />
      <path d="M40 12 L55 70" stroke="#C41E3A" strokeWidth="3" opacity="0.6" />
      {/* Flag on top */}
      <line x1="40" y1="12" x2="40" y2="4" stroke="#2A2A2A" strokeWidth="2" />
      <path d="M40 4 L50 7 L40 10" fill="#C41E3A" stroke="#2A2A2A" strokeWidth="1" />
      {/* Entrance */}
      <path d="M33 70 Q40 50 47 70" stroke="#2A2A2A" strokeWidth="1.5" fill="none" />
      {/* Ground line */}
      <line x1="5" y1="70" x2="75" y2="70" stroke="#2A2A2A" strokeWidth="2" />
    </svg>
  );
}
