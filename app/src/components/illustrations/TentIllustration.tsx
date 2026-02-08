export function TentIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Main tent shape */}
      <path d="M100 25 L175 155 H25 Z" stroke="#141414" strokeWidth="1.8" strokeLinejoin="round" />

      {/* Tent structure lines from apex */}
      <line x1="100" y1="25" x2="62" y2="155" stroke="#141414" strokeWidth="0.6" />
      <line x1="100" y1="25" x2="138" y2="155" stroke="#141414" strokeWidth="0.6" />
      <line x1="100" y1="25" x2="80" y2="155" stroke="#141414" strokeWidth="0.4" />
      <line x1="100" y1="25" x2="120" y2="155" stroke="#141414" strokeWidth="0.4" />

      {/* Left side crosshatching (shadow) */}
      <line x1="40" y1="130" x2="65" y2="60" stroke="#141414" strokeWidth="0.25" />
      <line x1="35" y1="140" x2="62" y2="65" stroke="#141414" strokeWidth="0.25" />
      <line x1="30" y1="150" x2="60" y2="72" stroke="#141414" strokeWidth="0.25" />
      <line x1="42" y1="145" x2="68" y2="70" stroke="#141414" strokeWidth="0.25" />
      <line x1="48" y1="150" x2="72" y2="75" stroke="#141414" strokeWidth="0.2" />
      <line x1="55" y1="155" x2="78" y2="78" stroke="#141414" strokeWidth="0.2" />
      {/* Counter crosshatch */}
      <line x1="35" y1="120" x2="60" y2="140" stroke="#141414" strokeWidth="0.2" />
      <line x1="38" y1="110" x2="58" y2="130" stroke="#141414" strokeWidth="0.2" />
      <line x1="42" y1="100" x2="55" y2="120" stroke="#141414" strokeWidth="0.2" />
      <line x1="48" y1="90" x2="54" y2="110" stroke="#141414" strokeWidth="0.2" />

      {/* Right side light hatching */}
      <line x1="130" y1="80" x2="160" y2="140" stroke="#141414" strokeWidth="0.15" />
      <line x1="135" y1="85" x2="165" y2="145" stroke="#141414" strokeWidth="0.15" />
      <line x1="125" y1="90" x2="155" y2="150" stroke="#141414" strokeWidth="0.15" />

      {/* Entrance arch */}
      <path d="M82 155 Q100 105 118 155" stroke="#141414" strokeWidth="1.5" fill="none" />
      <path d="M85 155 Q100 112 115 155" stroke="#141414" strokeWidth="0.5" fill="none" />
      {/* Entrance darkness - stippling */}
      <circle cx="95" cy="140" r="0.5" fill="#141414" />
      <circle cx="100" cy="135" r="0.4" fill="#141414" />
      <circle cx="105" cy="140" r="0.5" fill="#141414" />
      <circle cx="98" cy="145" r="0.4" fill="#141414" />
      <circle cx="102" cy="145" r="0.4" fill="#141414" />
      <circle cx="93" cy="148" r="0.3" fill="#141414" />
      <circle cx="107" cy="148" r="0.3" fill="#141414" />
      <circle cx="97" cy="150" r="0.4" fill="#141414" />
      <circle cx="103" cy="150" r="0.4" fill="#141414" />
      <circle cx="100" cy="142" r="0.3" fill="#141414" />
      <circle cx="96" cy="137" r="0.3" fill="#141414" />
      <circle cx="104" cy="137" r="0.3" fill="#141414" />

      {/* Flag on top */}
      <line x1="100" y1="25" x2="100" y2="8" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M100 8 L118 14 L100 20" stroke="#141414" strokeWidth="1" fill="none" />
      {/* Flag hatching */}
      <line x1="102" y1="10" x2="110" y2="13" stroke="#141414" strokeWidth="0.3" />
      <line x1="102" y1="13" x2="112" y2="15" stroke="#141414" strokeWidth="0.3" />
      <line x1="102" y1="16" x2="108" y2="17" stroke="#141414" strokeWidth="0.3" />

      {/* Ground line with texture */}
      <line x1="15" y1="155" x2="185" y2="155" stroke="#141414" strokeWidth="0.8" />
      {/* Ground stipple */}
      <circle cx="20" cy="158" r="0.3" fill="#141414" />
      <circle cx="30" cy="159" r="0.4" fill="#141414" />
      <circle cx="45" cy="158" r="0.3" fill="#141414" />
      <circle cx="60" cy="159" r="0.4" fill="#141414" />
      <circle cx="75" cy="158" r="0.3" fill="#141414" />
      <circle cx="90" cy="159" r="0.3" fill="#141414" />
      <circle cx="110" cy="159" r="0.3" fill="#141414" />
      <circle cx="125" cy="158" r="0.4" fill="#141414" />
      <circle cx="140" cy="159" r="0.3" fill="#141414" />
      <circle cx="155" cy="158" r="0.4" fill="#141414" />
      <circle cx="170" cy="159" r="0.3" fill="#141414" />
      <circle cx="180" cy="158" r="0.4" fill="#141414" />

      {/* Bunting with detail */}
      <path d="M38 55 L50 70 L62 55 L74 70 L86 55 L98 70 L110 55 L122 70 L134 55 L146 70 L158 55" stroke="#141414" strokeWidth="0.8" fill="none" />
      {/* Bunting fill hatching */}
      <line x1="42" y1="58" x2="48" y2="68" stroke="#141414" strokeWidth="0.2" />
      <line x1="46" y1="57" x2="50" y2="65" stroke="#141414" strokeWidth="0.2" />
      <line x1="66" y1="58" x2="72" y2="68" stroke="#141414" strokeWidth="0.2" />
      <line x1="70" y1="57" x2="74" y2="65" stroke="#141414" strokeWidth="0.2" />
      <line x1="90" y1="58" x2="96" y2="68" stroke="#141414" strokeWidth="0.2" />
      <line x1="94" y1="57" x2="98" y2="65" stroke="#141414" strokeWidth="0.2" />
      <line x1="114" y1="58" x2="120" y2="68" stroke="#141414" strokeWidth="0.2" />
      <line x1="118" y1="57" x2="122" y2="65" stroke="#141414" strokeWidth="0.2" />
      <line x1="138" y1="58" x2="144" y2="68" stroke="#141414" strokeWidth="0.2" />
      <line x1="142" y1="57" x2="146" y2="65" stroke="#141414" strokeWidth="0.2" />

      {/* Tent rope details */}
      <line x1="25" y1="155" x2="15" y2="165" stroke="#141414" strokeWidth="0.6" />
      <line x1="175" y1="155" x2="185" y2="165" stroke="#141414" strokeWidth="0.6" />
      {/* Rope pegs */}
      <line x1="13" y1="163" x2="17" y2="167" stroke="#141414" strokeWidth="0.8" />
      <line x1="183" y1="163" x2="187" y2="167" stroke="#141414" strokeWidth="0.8" />

      {/* Decorative stars */}
      <g transform="translate(20, 35)">
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#141414" strokeWidth="0.5" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#141414" strokeWidth="0.5" />
      </g>
      <g transform="translate(180, 40)">
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#141414" strokeWidth="0.5" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#141414" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
