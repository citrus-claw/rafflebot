export function StarDecoration({ className = '', size = 24 }: { className?: string; size?: number }) {
 return (
 <svg width={size} height={size} viewBox="0 0 24 24"fill="none"className={className}>
 <circle cx="12"cy="12"r="2"fill="#141414"/>
 <circle cx="4"cy="8"r="1"fill="#141414"/>
 <circle cx="20"cy="6"r="1.5"fill="#141414"/>
 <circle cx="18"cy="18"r="1"fill="#141414"/>
 </svg>
 );
}

export function Bunting({ className = '' }: { className?: string }) {
 return (
 <svg width={200} height={40} viewBox="0 0 200 40"fill="none"className={className}>
 <path d="M0 10 L20 30 L40 10 L60 30 L80 10 L100 30 L120 10 L140 30 L160 10 L180 30 L200 10"stroke="#141414"strokeWidth="1.2"fill="none"/>
 </svg>
 );
}

export function FerrisWheel({ className = '', size = 120 }: { className?: string; size?: number }) {
 return (
 <svg width={size} height={size} viewBox="0 0 200 200"fill="none"className={className}>
 {/* Outer rim */}
 <circle cx="100"cy="90"r="62"stroke="#141414"strokeWidth="0.5"/>
 <circle cx="100"cy="90"r="60"stroke="#141414"strokeWidth="1.5"/>
 <circle cx="100"cy="90"r="58"stroke="#141414"strokeWidth="0.5"/>

 {/* Center hub */}
 <circle cx="100"cy="90"r="8"stroke="#141414"strokeWidth="1.2"/>
 <circle cx="100"cy="90"r="4"stroke="#141414"strokeWidth="0.6"/>
 <circle cx="100"cy="90"r="1.5"fill="#141414"/>

 {/* Spokes with detail */}
 {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
 const rad = (angle * Math.PI) / 180;
 const x2 = 100 + 58 * Math.cos(rad);
 const y2 = 90 + 58 * Math.sin(rad);
 const xm1 = 100 + 30 * Math.cos(rad + 0.03);
 const ym1 = 90 + 30 * Math.sin(rad + 0.03);
 const xm2 = 100 + 30 * Math.cos(rad - 0.03);
 const ym2 = 90 + 30 * Math.sin(rad - 0.03);
 return (
 <g key={angle}>
 <line x1="100"y1="90"x2={x2} y2={y2} stroke="#141414"strokeWidth="0.8"/>
 {/* Spoke parallel detail line */}
 <line x1={100 + 10 * Math.cos(rad)} y1={90 + 10 * Math.sin(rad)} x2={xm1} y2={ym1} stroke="#141414"strokeWidth="0.2"/>
 <line x1={100 + 10 * Math.cos(rad)} y1={90 + 10 * Math.sin(rad)} x2={xm2} y2={ym2} stroke="#141414"strokeWidth="0.2"/>
 </g>
 );
 })}

 {/* Inner structural ring */}
 <circle cx="100"cy="90"r="30"stroke="#141414"strokeWidth="0.4"/>

 {/* Gondolas - detailed boxes */}
 {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
 const rad = (angle * Math.PI) / 180;
 const cx = 100 + 60 * Math.cos(rad);
 const cy = 90 + 60 * Math.sin(rad);
 return (
 <g key={angle}>
 <rect x={cx - 6} y={cy - 4} width="12"height="9"rx="1.5"stroke="#141414"strokeWidth="0.8"/>
 <line x1={cx - 4} y1={cy - 4} x2={cx - 4} y2={cy + 5} stroke="#141414"strokeWidth="0.2"/>
 <line x1={cx + 4} y1={cy - 4} x2={cx + 4} y2={cy + 5} stroke="#141414"strokeWidth="0.2"/>
 <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="#141414"strokeWidth="0.2"/>
 {/* Hanger line */}
 <line x1={cx} y1={cy - 4} x2={cx} y2={cy - 7} stroke="#141414"strokeWidth="0.5"/>
 </g>
 );
 })}

 {/* Support legs with crosshatching */}
 <line x1="100"y1="90"x2="68"y2="188"stroke="#141414"strokeWidth="1.8"/>
 <line x1="100"y1="90"x2="132"y2="188"stroke="#141414"strokeWidth="1.8"/>
 {/* Cross brace */}
 <line x1="82"y1="145"x2="118"y2="145"stroke="#141414"strokeWidth="0.8"/>
 <line x1="78"y1="160"x2="122"y2="160"stroke="#141414"strokeWidth="0.6"/>
 {/* Leg crosshatching */}
 <line x1="88"y1="120"x2="92"y2="115"stroke="#141414"strokeWidth="0.25"/>
 <line x1="85"y1="130"x2="89"y2="125"stroke="#141414"strokeWidth="0.25"/>
 <line x1="82"y1="140"x2="86"y2="135"stroke="#141414"strokeWidth="0.25"/>
 <line x1="79"y1="150"x2="83"y2="145"stroke="#141414"strokeWidth="0.25"/>
 <line x1="112"y1="120"x2="108"y2="115"stroke="#141414"strokeWidth="0.25"/>
 <line x1="115"y1="130"x2="111"y2="125"stroke="#141414"strokeWidth="0.25"/>
 <line x1="118"y1="140"x2="114"y2="135"stroke="#141414"strokeWidth="0.25"/>
 <line x1="121"y1="150"x2="117"y2="145"stroke="#141414"strokeWidth="0.25"/>

 {/* Base */}
 <line x1="62"y1="188"x2="138"y2="188"stroke="#141414"strokeWidth="1.8"/>
 <line x1="60"y1="190"x2="140"y2="190"stroke="#141414"strokeWidth="0.5"/>

 {/* Rim decorative dots */}
 {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => {
 const rad = (angle * Math.PI) / 180;
 const cx = 100 + 60 * Math.cos(rad);
 const cy = 90 + 60 * Math.sin(rad);
 return <circle key={`dot-${angle}`} cx={cx} cy={cy} r="0.6"fill="#141414"/>;
 })}
 </svg>
 );
}
