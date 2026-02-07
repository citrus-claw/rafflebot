export function RaffleDrum({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Drum body */}
      <ellipse cx="60" cy="80" rx="38" ry="12" stroke="#2A2A2A" strokeWidth="2.5" fill="#FEFDFB" />
      <rect x="22" y="40" width="76" height="40" stroke="#2A2A2A" strokeWidth="2.5" fill="#FEFDFB" />
      <ellipse cx="60" cy="40" rx="38" ry="12" stroke="#2A2A2A" strokeWidth="2.5" fill="#FEFDFB" />
      {/* Red stripes on drum */}
      <path d="M26 50 L94 50" stroke="#C41E3A" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M24 60 L96 60" stroke="#C41E3A" strokeWidth="2" />
      <path d="M26 70 L94 70" stroke="#C41E3A" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Handle/crank */}
      <line x1="98" y1="55" x2="112" y2="45" stroke="#2A2A2A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="112" cy="42" r="5" stroke="#2A2A2A" strokeWidth="2" fill="#DAA520" />
      {/* Stars decoration */}
      <path d="M45 38 L46.5 34 L48 38 L44 35.5 L50 35.5 Z" fill="#DAA520" />
      <path d="M70 38 L71.5 34 L73 38 L69 35.5 L75 35.5 Z" fill="#DAA520" />
      {/* Tickets peeking out */}
      <rect x="50" y="28" width="16" height="10" rx="1" stroke="#C41E3A" strokeWidth="1.5" fill="#FFF" transform="rotate(-15 58 33)" />
      <rect x="55" y="25" width="16" height="10" rx="1" stroke="#2A2A2A" strokeWidth="1.5" fill="#FFF" transform="rotate(10 63 30)" />
      {/* Legs */}
      <line x1="35" y1="92" x2="30" y2="108" stroke="#2A2A2A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="85" y1="92" x2="90" y2="108" stroke="#2A2A2A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
