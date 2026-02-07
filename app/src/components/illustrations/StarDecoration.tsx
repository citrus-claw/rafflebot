export function StarDecoration({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2 L14.5 8.5 L21.5 9.5 L16.5 14 L18 21 L12 17.5 L6 21 L7.5 14 L2.5 9.5 L9.5 8.5 Z" stroke="#2A2A2A" strokeWidth="1.5" fill="#DAA520" opacity="0.8" />
    </svg>
  );
}

export function Bunting({ className = '' }: { className?: string }) {
  return (
    <svg width="200" height="32" viewBox="0 0 200 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 4 Q25 4 25 4 L15 28 L5 4" stroke="#2A2A2A" strokeWidth="1" fill="#C41E3A" opacity="0.7" />
      <path d="M30 4 Q55 4 55 4 L45 26 L35 4" stroke="#2A2A2A" strokeWidth="1" fill="#DAA520" opacity="0.7" />
      <path d="M60 4 Q85 4 85 4 L75 28 L65 4" stroke="#2A2A2A" strokeWidth="1" fill="#C41E3A" opacity="0.7" />
      <path d="M90 4 Q115 4 115 4 L105 26 L95 4" stroke="#2A2A2A" strokeWidth="1" fill="#DAA520" opacity="0.7" />
      <path d="M120 4 Q145 4 145 4 L135 28 L125 4" stroke="#2A2A2A" strokeWidth="1" fill="#C41E3A" opacity="0.7" />
      <path d="M150 4 Q175 4 175 4 L165 26 L155 4" stroke="#2A2A2A" strokeWidth="1" fill="#DAA520" opacity="0.7" />
      <path d="M180 4 Q200 4 200 4 L195 28 L185 4" stroke="#2A2A2A" strokeWidth="1" fill="#C41E3A" opacity="0.7" />
      {/* String */}
      <path d="M0 4 Q50 8 100 4 Q150 0 200 4" stroke="#2A2A2A" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
