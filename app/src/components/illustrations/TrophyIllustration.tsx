export function TrophyIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M25 15 L25 40 Q25 55 40 55 Q55 55 55 40 L55 15 Z" stroke="#2A2A2A" strokeWidth="2.5" fill="#FEFDFB" />
      {/* Gold fill accent */}
      <path d="M28 18 L28 38 Q28 52 40 52 Q52 52 52 38 L52 18 Z" fill="#DAA520" opacity="0.15" />
      {/* Left handle */}
      <path d="M25 22 Q12 22 12 32 Q12 42 25 42" stroke="#2A2A2A" strokeWidth="2" fill="none" />
      {/* Right handle */}
      <path d="M55 22 Q68 22 68 32 Q68 42 55 42" stroke="#2A2A2A" strokeWidth="2" fill="none" />
      {/* Stem */}
      <line x1="40" y1="55" x2="40" y2="65" stroke="#2A2A2A" strokeWidth="2.5" />
      {/* Base */}
      <rect x="28" y="65" width="24" height="4" rx="2" stroke="#2A2A2A" strokeWidth="2" fill="#FEFDFB" />
      {/* Star on cup */}
      <path d="M40 30 L42.5 24 L45 30 L39 27 L46 27 Z" fill="#DAA520" />
      {/* Rim */}
      <line x1="25" y1="15" x2="55" y2="15" stroke="#DAA520" strokeWidth="2" />
    </svg>
  );
}
