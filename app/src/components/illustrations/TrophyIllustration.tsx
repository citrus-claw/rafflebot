export function TrophyIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Cup body */}
      <path d="M65 50 H135 L125 110 H75 Z" stroke="#141414" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Left handle */}
      <path d="M65 60 C40 60, 35 90, 65 95" stroke="#141414" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Right handle */}
      <path d="M135 60 C160 60, 165 90, 135 95" stroke="#141414" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <line x1="100" y1="110" x2="100" y2="140" stroke="#141414" strokeWidth="1.8" />
      {/* Base */}
      <ellipse cx="100" cy="145" rx="30" ry="6" stroke="#141414" strokeWidth="1.8" />
      {/* Base plate */}
      <rect x="70" y="148" width="60" height="8" rx="2" stroke="#141414" strokeWidth="1.5" />
      {/* Decorative lines on cup */}
      <line x1="75" y1="70" x2="125" y2="70" stroke="#141414" strokeWidth="0.8" strokeDasharray="3 2" />
      <line x1="77" y1="90" x2="123" y2="90" stroke="#141414" strokeWidth="0.8" strokeDasharray="3 2" />
      {/* Star on cup */}
      <polygon points="100,75 103,83 111,83 105,88 107,96 100,91 93,96 95,88 89,83 97,83" stroke="#141414" strokeWidth="1" fill="none" />
      {/* Sparkles */}
      <circle cx="55" cy="45" r="1.5" fill="#141414" />
      <circle cx="145" cy="42" r="2" fill="#141414" />
      <circle cx="100" cy="35" r="1" fill="#141414" />
    </svg>
  );
}
