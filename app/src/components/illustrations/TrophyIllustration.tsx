export function TrophyIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Cup body */}
      <path d="M65 50 H135 L125 110 H75 Z" stroke="#141414" strokeWidth="1.8" strokeLinejoin="round" />

      {/* Left handle - detailed */}
      <path d="M65 60 C38 58, 30 92, 65 97" stroke="#141414" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M65 65 C45 63, 38 88, 65 92" stroke="#141414" strokeWidth="0.5" fill="none" />

      {/* Right handle - detailed */}
      <path d="M135 60 C162 58, 170 92, 135 97" stroke="#141414" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M135 65 C155 63, 162 88, 135 92" stroke="#141414" strokeWidth="0.5" fill="none" />

      {/* Handle crosshatching - left */}
      <line x1="50" y1="65" x2="55" y2="75" stroke="#141414" strokeWidth="0.3" />
      <line x1="45" y1="70" x2="52" y2="80" stroke="#141414" strokeWidth="0.3" />
      <line x1="42" y1="75" x2="50" y2="85" stroke="#141414" strokeWidth="0.3" />
      <line x1="40" y1="80" x2="50" y2="90" stroke="#141414" strokeWidth="0.3" />
      {/* Handle crosshatching - right */}
      <line x1="150" y1="65" x2="145" y2="75" stroke="#141414" strokeWidth="0.3" />
      <line x1="155" y1="70" x2="148" y2="80" stroke="#141414" strokeWidth="0.3" />
      <line x1="158" y1="75" x2="150" y2="85" stroke="#141414" strokeWidth="0.3" />
      <line x1="160" y1="80" x2="150" y2="90" stroke="#141414" strokeWidth="0.3" />

      {/* Decorative bands on cup */}
      <line x1="70" y1="65" x2="130" y2="65" stroke="#141414" strokeWidth="0.8" />
      <line x1="71" y1="68" x2="129" y2="68" stroke="#141414" strokeWidth="0.4" />
      <line x1="77" y1="95" x2="123" y2="95" stroke="#141414" strokeWidth="0.8" />
      <line x1="78" y1="98" x2="122" y2="98" stroke="#141414" strokeWidth="0.4" />

      {/* Crosshatching on cup body - shading left side */}
      <line x1="68" y1="70" x2="72" y2="92" stroke="#141414" strokeWidth="0.25" />
      <line x1="71" y1="70" x2="74" y2="92" stroke="#141414" strokeWidth="0.25" />
      <line x1="74" y1="70" x2="76" y2="92" stroke="#141414" strokeWidth="0.25" />
      <line x1="77" y1="70" x2="78" y2="92" stroke="#141414" strokeWidth="0.2" />
      {/* Shading right side */}
      <line x1="122" y1="70" x2="120" y2="92" stroke="#141414" strokeWidth="0.25" />
      <line x1="125" y1="70" x2="122" y2="92" stroke="#141414" strokeWidth="0.25" />
      <line x1="128" y1="70" x2="124" y2="92" stroke="#141414" strokeWidth="0.25" />

      {/* Engraved star on cup */}
      <polygon points="100,72 103,81 112,81 105,87 108,96 100,90 92,96 95,87 88,81 97,81" stroke="#141414" strokeWidth="0.8" fill="none" />
      <polygon points="100,75 102,81 108,81 103,85 105,91 100,87 95,91 97,85 92,81 98,81" stroke="#141414" strokeWidth="0.4" fill="none" />
      {/* Star center dot */}
      <circle cx="100" cy="84" r="1" fill="#141414" />

      {/* Stippling inside cup below star */}
      <circle cx="90" cy="100" r="0.4" fill="#141414" />
      <circle cx="95" cy="102" r="0.3" fill="#141414" />
      <circle cx="100" cy="100" r="0.4" fill="#141414" />
      <circle cx="105" cy="103" r="0.3" fill="#141414" />
      <circle cx="110" cy="100" r="0.4" fill="#141414" />
      <circle cx="85" cy="105" r="0.3" fill="#141414" />
      <circle cx="92" cy="106" r="0.4" fill="#141414" />
      <circle cx="100" cy="105" r="0.3" fill="#141414" />
      <circle cx="108" cy="106" r="0.4" fill="#141414" />
      <circle cx="115" cy="105" r="0.3" fill="#141414" />

      {/* Stem */}
      <line x1="100" y1="110" x2="100" y2="140" stroke="#141414" strokeWidth="2" />
      <line x1="97" y1="112" x2="97" y2="138" stroke="#141414" strokeWidth="0.4" />
      <line x1="103" y1="112" x2="103" y2="138" stroke="#141414" strokeWidth="0.4" />
      {/* Stem crosshatch */}
      <line x1="97" y1="118" x2="103" y2="115" stroke="#141414" strokeWidth="0.2" />
      <line x1="97" y1="124" x2="103" y2="121" stroke="#141414" strokeWidth="0.2" />
      <line x1="97" y1="130" x2="103" y2="127" stroke="#141414" strokeWidth="0.2" />
      <line x1="97" y1="136" x2="103" y2="133" stroke="#141414" strokeWidth="0.2" />

      {/* Base */}
      <ellipse cx="100" cy="142" rx="30" ry="6" stroke="#141414" strokeWidth="1.5" />
      <ellipse cx="100" cy="144" rx="28" ry="4" stroke="#141414" strokeWidth="0.4" />

      {/* Base plate */}
      <rect x="68" y="148" width="64" height="10" rx="2" stroke="#141414" strokeWidth="1.5" />
      {/* Base plate engraving */}
      <line x1="72" y1="153" x2="128" y2="153" stroke="#141414" strokeWidth="0.4" />
      <line x1="74" y1="150" x2="126" y2="150" stroke="#141414" strokeWidth="0.3" />
      <line x1="74" y1="156" x2="126" y2="156" stroke="#141414" strokeWidth="0.3" />
      {/* Base crosshatching */}
      <line x1="75" y1="149" x2="75" y2="157" stroke="#141414" strokeWidth="0.2" />
      <line x1="80" y1="149" x2="80" y2="157" stroke="#141414" strokeWidth="0.2" />
      <line x1="85" y1="149" x2="85" y2="157" stroke="#141414" strokeWidth="0.15" />
      <line x1="115" y1="149" x2="115" y2="157" stroke="#141414" strokeWidth="0.15" />
      <line x1="120" y1="149" x2="120" y2="157" stroke="#141414" strokeWidth="0.2" />
      <line x1="125" y1="149" x2="125" y2="157" stroke="#141414" strokeWidth="0.2" />

      {/* Sparkle decorations */}
      <g transform="translate(55, 42)">
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#141414" strokeWidth="0.6" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#141414" strokeWidth="0.6" />
        <line x1="-2" y1="-2" x2="2" y2="2" stroke="#141414" strokeWidth="0.4" />
        <line x1="2" y1="-2" x2="-2" y2="2" stroke="#141414" strokeWidth="0.4" />
      </g>
      <g transform="translate(148, 40)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#141414" strokeWidth="0.7" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#141414" strokeWidth="0.7" />
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#141414" strokeWidth="0.4" />
        <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#141414" strokeWidth="0.4" />
      </g>
      <g transform="translate(100, 32)">
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#141414" strokeWidth="0.5" />
        <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#141414" strokeWidth="0.5" />
      </g>

      {/* Rim highlight */}
      <line x1="70" y1="52" x2="130" y2="52" stroke="#141414" strokeWidth="0.4" />
    </svg>
  );
}
