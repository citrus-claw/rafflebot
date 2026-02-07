export function TicketIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 80 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="76" height="40" rx="3" stroke="#2A2A2A" strokeWidth="2" fill="#FEFDFB" />
      {/* Perforated line */}
      <line x1="58" y1="4" x2="58" y2="44" stroke="#2A2A2A" strokeWidth="1" strokeDasharray="3 3" />
      {/* Top red stripe */}
      <rect x="4" y="6" width="52" height="4" rx="1" fill="#C41E3A" opacity="0.8" />
      {/* ADMIT ONE text area */}
      <text x="30" y="28" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#2A2A2A" fontWeight="bold">ADMIT ONE</text>
      {/* Star */}
      <path d="M67 24 L69 19 L71 24 L66 21 L72 21 Z" fill="#DAA520" />
      {/* Serial number */}
      <text x="30" y="38" textAnchor="middle" fontSize="4" fontFamily="monospace" fill="#999">№ 000142</text>
    </svg>
  );
}
