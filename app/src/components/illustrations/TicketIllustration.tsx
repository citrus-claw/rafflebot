export function TicketIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Ticket body */}
      <rect x="25" y="60" width="150" height="80" rx="4" stroke="#141414" strokeWidth="1.8" />
      {/* Perforation line */}
      <line x1="140" y1="60" x2="140" y2="140" stroke="#141414" strokeWidth="1.2" strokeDasharray="4 3" />
      {/* Notches */}
      <circle cx="140" cy="60" r="6" fill="#FBF7EB" stroke="#141414" strokeWidth="1.2" />
      <circle cx="140" cy="140" r="6" fill="#FBF7EB" stroke="#141414" strokeWidth="1.2" />
      {/* ADMIT ONE vertical text area */}
      <line x1="155" y1="75" x2="155" y2="125" stroke="#141414" strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Ticket content lines */}
      <line x1="40" y1="80" x2="120" y2="80" stroke="#141414" strokeWidth="1.2" />
      <line x1="40" y1="95" x2="100" y2="95" stroke="#141414" strokeWidth="0.8" strokeDasharray="3 2" />
      <line x1="40" y1="108" x2="110" y2="108" stroke="#141414" strokeWidth="0.8" strokeDasharray="3 2" />
      {/* Star decorations */}
      <circle cx="45" cy="125" r="2" fill="#141414" />
      <circle cx="55" cy="125" r="2" fill="#141414" />
      <circle cx="65" cy="125" r="2" fill="#141414" />
      {/* Number */}
      <text x="80" y="130" fontFamily="IBM Plex Mono" fontSize="10" fill="#141414" fontWeight="600">№001</text>
    </svg>
  );
}
