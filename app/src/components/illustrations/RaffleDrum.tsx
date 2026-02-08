export function RaffleDrum({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      {/* === DRUM BODY === */}
      {/* Main barrel outline */}
      <ellipse cx="100" cy="140" rx="65" ry="20" stroke="#141414" strokeWidth="1.8" />
      <ellipse cx="100" cy="80" rx="65" ry="20" stroke="#141414" strokeWidth="1.8" />
      <line x1="35" y1="80" x2="35" y2="140" stroke="#141414" strokeWidth="1.8" />
      <line x1="165" y1="80" x2="165" y2="140" stroke="#141414" strokeWidth="1.8" />

      {/* Barrel bands - solid rings */}
      <ellipse cx="100" cy="95" rx="65" ry="19" stroke="#141414" strokeWidth="0.6" />
      <ellipse cx="100" cy="110" rx="65" ry="19" stroke="#141414" strokeWidth="0.6" />
      <ellipse cx="100" cy="125" rx="65" ry="19.5" stroke="#141414" strokeWidth="0.6" />

      {/* Crosshatching on drum body - left side */}
      <line x1="40" y1="85" x2="45" y2="135" stroke="#141414" strokeWidth="0.3" />
      <line x1="48" y1="83" x2="52" y2="137" stroke="#141414" strokeWidth="0.3" />
      <line x1="56" y1="81" x2="59" y2="138" stroke="#141414" strokeWidth="0.3" />
      <line x1="64" y1="80" x2="66" y2="139" stroke="#141414" strokeWidth="0.3" />
      <line x1="72" y1="78" x2="73" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="80" y1="77" x2="80" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="88" y1="76" x2="87" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="96" y1="76" x2="94" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="104" y1="76" x2="106" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="112" y1="76" x2="113" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="120" y1="77" x2="120" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="128" y1="78" x2="127" y2="140" stroke="#141414" strokeWidth="0.3" />
      <line x1="136" y1="80" x2="134" y2="139" stroke="#141414" strokeWidth="0.3" />
      <line x1="144" y1="81" x2="141" y2="138" stroke="#141414" strokeWidth="0.3" />
      <line x1="152" y1="83" x2="148" y2="137" stroke="#141414" strokeWidth="0.3" />
      <line x1="160" y1="85" x2="155" y2="135" stroke="#141414" strokeWidth="0.3" />

      {/* Cross-hatch diagonal lines (opposing direction) */}
      <line x1="42" y1="135" x2="55" y2="82" stroke="#141414" strokeWidth="0.2" />
      <line x1="55" y1="137" x2="70" y2="79" stroke="#141414" strokeWidth="0.2" />
      <line x1="68" y1="139" x2="85" y2="77" stroke="#141414" strokeWidth="0.2" />
      <line x1="82" y1="140" x2="100" y2="76" stroke="#141414" strokeWidth="0.2" />
      <line x1="100" y1="140" x2="118" y2="77" stroke="#141414" strokeWidth="0.2" />
      <line x1="115" y1="139" x2="132" y2="79" stroke="#141414" strokeWidth="0.2" />
      <line x1="130" y1="138" x2="145" y2="82" stroke="#141414" strokeWidth="0.2" />
      <line x1="145" y1="136" x2="158" y2="84" stroke="#141414" strokeWidth="0.2" />

      {/* Stippling/dots on drum surface */}
      <circle cx="50" cy="100" r="0.6" fill="#141414" />
      <circle cx="55" cy="115" r="0.5" fill="#141414" />
      <circle cx="60" cy="105" r="0.4" fill="#141414" />
      <circle cx="65" cy="120" r="0.6" fill="#141414" />
      <circle cx="70" cy="95" r="0.4" fill="#141414" />
      <circle cx="75" cy="110" r="0.5" fill="#141414" />
      <circle cx="80" cy="125" r="0.4" fill="#141414" />
      <circle cx="85" cy="100" r="0.6" fill="#141414" />
      <circle cx="90" cy="115" r="0.4" fill="#141414" />
      <circle cx="95" cy="130" r="0.5" fill="#141414" />
      <circle cx="100" cy="105" r="0.4" fill="#141414" />
      <circle cx="105" cy="120" r="0.6" fill="#141414" />
      <circle cx="110" cy="95" r="0.4" fill="#141414" />
      <circle cx="115" cy="110" r="0.5" fill="#141414" />
      <circle cx="120" cy="130" r="0.4" fill="#141414" />
      <circle cx="125" cy="100" r="0.6" fill="#141414" />
      <circle cx="130" cy="115" r="0.4" fill="#141414" />
      <circle cx="135" cy="105" r="0.5" fill="#141414" />
      <circle cx="140" cy="125" r="0.4" fill="#141414" />
      <circle cx="145" cy="95" r="0.6" fill="#141414" />
      <circle cx="150" cy="110" r="0.4" fill="#141414" />
      <circle cx="48" cy="125" r="0.3" fill="#141414" />
      <circle cx="152" cy="100" r="0.3" fill="#141414" />

      {/* Decorative band engravings */}
      <path d="M45 95 Q55 92 65 95 Q75 98 85 95 Q95 92 105 95 Q115 98 125 95 Q135 92 145 95 Q155 98 160 95" stroke="#141414" strokeWidth="0.4" fill="none" />
      <path d="M43 125 Q53 122 63 125 Q73 128 83 125 Q93 122 103 125 Q113 128 123 125 Q133 122 143 125 Q153 128 158 125" stroke="#141414" strokeWidth="0.4" fill="none" />

      {/* Top ellipse detail - crosshatch shading */}
      <ellipse cx="100" cy="80" rx="50" ry="12" stroke="#141414" strokeWidth="0.3" />
      <line x1="55" y1="78" x2="65" y2="82" stroke="#141414" strokeWidth="0.2" />
      <line x1="60" y1="76" x2="70" y2="82" stroke="#141414" strokeWidth="0.2" />
      <line x1="65" y1="74" x2="75" y2="82" stroke="#141414" strokeWidth="0.2" />
      <line x1="125" y1="82" x2="135" y2="78" stroke="#141414" strokeWidth="0.2" />
      <line x1="130" y1="82" x2="140" y2="76" stroke="#141414" strokeWidth="0.2" />
      <line x1="135" y1="82" x2="145" y2="74" stroke="#141414" strokeWidth="0.2" />

      {/* === HANDLE/CRANK === */}
      <line x1="165" y1="110" x2="182" y2="97" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
      {/* Crank handle detail */}
      <circle cx="185" cy="94" r="6" stroke="#141414" strokeWidth="1.8" />
      <circle cx="185" cy="94" r="3" stroke="#141414" strokeWidth="0.8" />
      <circle cx="185" cy="94" r="1" fill="#141414" />
      {/* Handle joint detail */}
      <circle cx="165" cy="110" r="3" stroke="#141414" strokeWidth="0.8" />
      <line x1="168" y1="108" x2="172" y2="104" stroke="#141414" strokeWidth="0.5" />

      {/* === LEGS with engraving detail === */}
      <line x1="55" y1="140" x2="42" y2="178" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
      <line x1="145" y1="140" x2="158" y2="178" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
      {/* Leg crosshatching */}
      <line x1="52" y1="148" x2="56" y2="146" stroke="#141414" strokeWidth="0.3" />
      <line x1="50" y1="155" x2="54" y2="153" stroke="#141414" strokeWidth="0.3" />
      <line x1="48" y1="162" x2="52" y2="160" stroke="#141414" strokeWidth="0.3" />
      <line x1="46" y1="169" x2="50" y2="167" stroke="#141414" strokeWidth="0.3" />
      <line x1="148" y1="148" x2="144" y2="146" stroke="#141414" strokeWidth="0.3" />
      <line x1="150" y1="155" x2="146" y2="153" stroke="#141414" strokeWidth="0.3" />
      <line x1="152" y1="162" x2="148" y2="160" stroke="#141414" strokeWidth="0.3" />
      <line x1="154" y1="169" x2="150" y2="167" stroke="#141414" strokeWidth="0.3" />
      {/* Feet */}
      <line x1="37" y1="178" x2="47" y2="178" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
      <line x1="153" y1="178" x2="163" y2="178" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
      {/* Foot detail */}
      <line x1="38" y1="180" x2="46" y2="180" stroke="#141414" strokeWidth="0.5" />
      <line x1="154" y1="180" x2="162" y2="180" stroke="#141414" strokeWidth="0.5" />
      {/* Cross brace between legs */}
      <line x1="48" y1="165" x2="152" y2="165" stroke="#141414" strokeWidth="0.6" />
      <line x1="50" y1="163" x2="150" y2="167" stroke="#141414" strokeWidth="0.3" />

      {/* === TICKETS FLYING OUT — detailed === */}
      {/* Ticket 1 */}
      <g transform="rotate(-20 82 55)">
        <rect x="72" y="48" width="20" height="14" rx="1.5" stroke="#141414" strokeWidth="1.2" />
        <line x1="86" y1="48" x2="86" y2="62" stroke="#141414" strokeWidth="0.6" strokeDasharray="1.5 1" />
        <line x1="75" y1="52" x2="83" y2="52" stroke="#141414" strokeWidth="0.4" />
        <line x1="75" y1="55" x2="81" y2="55" stroke="#141414" strokeWidth="0.3" />
        <line x1="75" y1="58" x2="83" y2="58" stroke="#141414" strokeWidth="0.3" />
      </g>
      {/* Ticket 2 */}
      <g transform="rotate(12 112 48)">
        <rect x="102" y="41" width="20" height="14" rx="1.5" stroke="#141414" strokeWidth="1.2" />
        <line x1="116" y1="41" x2="116" y2="55" stroke="#141414" strokeWidth="0.6" strokeDasharray="1.5 1" />
        <line x1="105" y1="45" x2="113" y2="45" stroke="#141414" strokeWidth="0.4" />
        <line x1="105" y1="48" x2="111" y2="48" stroke="#141414" strokeWidth="0.3" />
        <line x1="105" y1="51" x2="113" y2="51" stroke="#141414" strokeWidth="0.3" />
      </g>
      {/* Ticket 3 */}
      <g transform="rotate(30 125 58)">
        <rect x="115" y="51" width="20" height="14" rx="1.5" stroke="#141414" strokeWidth="1.2" />
        <line x1="129" y1="51" x2="129" y2="65" stroke="#141414" strokeWidth="0.6" strokeDasharray="1.5 1" />
        <line x1="118" y1="55" x2="126" y2="55" stroke="#141414" strokeWidth="0.4" />
        <line x1="118" y1="58" x2="124" y2="58" stroke="#141414" strokeWidth="0.3" />
      </g>
      {/* Ticket 4 - small, further away */}
      <g transform="rotate(-35 70 40)">
        <rect x="62" y="34" width="16" height="11" rx="1" stroke="#141414" strokeWidth="0.8" />
        <line x1="73" y1="34" x2="73" y2="45" stroke="#141414" strokeWidth="0.4" strokeDasharray="1 1" />
      </g>

      {/* === DECORATIVE ELEMENTS === */}
      {/* Stars / sparkles */}
      <g transform="translate(72, 28)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#141414" strokeWidth="0.8" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#141414" strokeWidth="0.8" />
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#141414" strokeWidth="0.5" />
        <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#141414" strokeWidth="0.5" />
      </g>
      <g transform="translate(135, 30)">
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#141414" strokeWidth="0.6" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#141414" strokeWidth="0.6" />
        <line x1="-2" y1="-2" x2="2" y2="2" stroke="#141414" strokeWidth="0.4" />
        <line x1="2" y1="-2" x2="-2" y2="2" stroke="#141414" strokeWidth="0.4" />
      </g>
      <g transform="translate(95, 22)">
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#141414" strokeWidth="0.5" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#141414" strokeWidth="0.5" />
      </g>
      {/* Motion lines */}
      <path d="M68 45 Q62 42 58 45" stroke="#141414" strokeWidth="0.5" fill="none" />
      <path d="M65 50 Q58 47 54 50" stroke="#141414" strokeWidth="0.4" fill="none" />
      <path d="M140 38 Q146 35 150 38" stroke="#141414" strokeWidth="0.5" fill="none" />
      <path d="M138 44 Q145 41 148 44" stroke="#141414" strokeWidth="0.4" fill="none" />

      {/* Small decorative dots around drum */}
      <circle cx="38" cy="100" r="0.4" fill="#141414" />
      <circle cx="36" cy="110" r="0.3" fill="#141414" />
      <circle cx="37" cy="120" r="0.4" fill="#141414" />
      <circle cx="162" cy="100" r="0.4" fill="#141414" />
      <circle cx="164" cy="110" r="0.3" fill="#141414" />
      <circle cx="163" cy="120" r="0.4" fill="#141414" />

      {/* Ornamental rosette on drum front */}
      <circle cx="100" cy="110" r="8" stroke="#141414" strokeWidth="0.5" />
      <circle cx="100" cy="110" r="5" stroke="#141414" strokeWidth="0.4" />
      <circle cx="100" cy="110" r="2" fill="#141414" />
      <line x1="100" y1="102" x2="100" y2="104" stroke="#141414" strokeWidth="0.4" />
      <line x1="100" y1="116" x2="100" y2="118" stroke="#141414" strokeWidth="0.4" />
      <line x1="92" y1="110" x2="94" y2="110" stroke="#141414" strokeWidth="0.4" />
      <line x1="106" y1="110" x2="108" y2="110" stroke="#141414" strokeWidth="0.4" />
      <line x1="94.3" y1="104.3" x2="95.7" y2="105.7" stroke="#141414" strokeWidth="0.3" />
      <line x1="104.3" y1="114.3" x2="105.7" y2="115.7" stroke="#141414" strokeWidth="0.3" />
      <line x1="104.3" y1="104.3" x2="105.7" y2="105.7" stroke="#141414" strokeWidth="0.3" />
      <line x1="94.3" y1="114.3" x2="95.7" y2="115.7" stroke="#141414" strokeWidth="0.3" />

      {/* Ground shadow stipple */}
      <circle cx="80" cy="182" r="0.4" fill="#141414" opacity="0.3" />
      <circle cx="85" cy="183" r="0.3" fill="#141414" opacity="0.3" />
      <circle cx="90" cy="184" r="0.4" fill="#141414" opacity="0.3" />
      <circle cx="95" cy="184" r="0.3" fill="#141414" opacity="0.3" />
      <circle cx="100" cy="185" r="0.4" fill="#141414" opacity="0.3" />
      <circle cx="105" cy="184" r="0.3" fill="#141414" opacity="0.3" />
      <circle cx="110" cy="184" r="0.4" fill="#141414" opacity="0.3" />
      <circle cx="115" cy="183" r="0.3" fill="#141414" opacity="0.3" />
      <circle cx="120" cy="182" r="0.4" fill="#141414" opacity="0.3" />
    </svg>
  );
}
