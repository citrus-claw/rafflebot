export function TicketIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
 return (
 <svg width={size} height={size} viewBox="0 0 200 200"fill="none"className={className}>
 {/* Ticket body */}
 <rect x="20"y="55"width="160"height="90"rx="3"stroke="#141414"strokeWidth="1.8"/>

 {/* Perforation line with notches */}
 <line x1="145"y1="55"x2="145"y2="145"stroke="#141414"strokeWidth="1"strokeDasharray="3 2.5"/>
 <circle cx="145"cy="55"r="7"fill="#FBF7EB"stroke="#141414"strokeWidth="1.2"/>
 <circle cx="145"cy="145"r="7"fill="#FBF7EB"stroke="#141414"strokeWidth="1.2"/>

 {/* Inner border frame */}
 <rect x="28"y="63"width="110"height="74"rx="1"stroke="#141414"strokeWidth="0.5"/>

 {/* Header line */}
 <line x1="35"y1="78"x2="130"y2="78"stroke="#141414"strokeWidth="1"/>
 <line x1="35"y1="80"x2="130"y2="80"stroke="#141414"strokeWidth="0.3"/>

 {/* Content lines - engraved style */}
 <line x1="35"y1="90"x2="115"y2="90"stroke="#141414"strokeWidth="0.6"/>
 <line x1="35"y1="98"x2="105"y2="98"stroke="#141414"strokeWidth="0.4"/>
 <line x1="35"y1="106"x2="120"y2="106"stroke="#141414"strokeWidth="0.4"/>
 <line x1="35"y1="114"x2="95"y2="114"stroke="#141414"strokeWidth="0.4"/>

 {/* Crosshatching in corner decoration - top left */}
 <line x1="30"y1="65"x2="38"y2="65"stroke="#141414"strokeWidth="0.3"/>
 <line x1="30"y1="67"x2="36"y2="67"stroke="#141414"strokeWidth="0.3"/>
 <line x1="30"y1="69"x2="34"y2="69"stroke="#141414"strokeWidth="0.3"/>
 <line x1="30"y1="65"x2="30"y2="73"stroke="#141414"strokeWidth="0.3"/>
 <line x1="32"y1="65"x2="32"y2="71"stroke="#141414"strokeWidth="0.3"/>
 <line x1="34"y1="65"x2="34"y2="69"stroke="#141414"strokeWidth="0.3"/>

 {/* Crosshatching - bottom right of main area */}
 <line x1="120"y1="127"x2="136"y2="127"stroke="#141414"strokeWidth="0.3"/>
 <line x1="122"y1="129"x2="136"y2="129"stroke="#141414"strokeWidth="0.3"/>
 <line x1="124"y1="131"x2="136"y2="131"stroke="#141414"strokeWidth="0.3"/>
 <line x1="126"y1="133"x2="136"y2="133"stroke="#141414"strokeWidth="0.3"/>
 <line x1="128"y1="135"x2="136"y2="135"stroke="#141414"strokeWidth="0.3"/>

 {/* Stub area crosshatching */}
 <line x1="152"y1="62"x2="152"y2="138"stroke="#141414"strokeWidth="0.3"/>
 <line x1="155"y1="62"x2="155"y2="138"stroke="#141414"strokeWidth="0.2"/>
 <line x1="158"y1="62"x2="158"y2="138"stroke="#141414"strokeWidth="0.3"/>
 <line x1="161"y1="62"x2="161"y2="138"stroke="#141414"strokeWidth="0.2"/>
 <line x1="164"y1="62"x2="164"y2="138"stroke="#141414"strokeWidth="0.3"/>
 <line x1="167"y1="62"x2="167"y2="138"stroke="#141414"strokeWidth="0.2"/>
 <line x1="170"y1="62"x2="170"y2="138"stroke="#141414"strokeWidth="0.3"/>
 {/* Horizontal cross lines on stub */}
 <line x1="150"y1="70"x2="175"y2="70"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="80"x2="175"y2="80"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="90"x2="175"y2="90"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="100"x2="175"y2="100"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="110"x2="175"y2="110"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="120"x2="175"y2="120"stroke="#141414"strokeWidth="0.2"/>
 <line x1="150"y1="130"x2="175"y2="130"stroke="#141414"strokeWidth="0.2"/>

 {/* Decorative rosette */}
 <circle cx="75"cy="125"r="6"stroke="#141414"strokeWidth="0.5"/>
 <circle cx="75"cy="125"r="3"stroke="#141414"strokeWidth="0.4"/>
 <circle cx="75"cy="125"r="1"fill="#141414"/>
 <line x1="75"y1="119"x2="75"y2="121"stroke="#141414"strokeWidth="0.3"/>
 <line x1="75"y1="129"x2="75"y2="131"stroke="#141414"strokeWidth="0.3"/>
 <line x1="69"y1="125"x2="71"y2="125"stroke="#141414"strokeWidth="0.3"/>
 <line x1="79"y1="125"x2="81"y2="125"stroke="#141414"strokeWidth="0.3"/>

 {/* Star decorations */}
 <g transform="translate(42, 125)">
 <line x1="0"y1="-2.5"x2="0"y2="2.5"stroke="#141414"strokeWidth="0.5"/>
 <line x1="-2.5"y1="0"x2="2.5"y2="0"stroke="#141414"strokeWidth="0.5"/>
 <line x1="-1.5"y1="-1.5"x2="1.5"y2="1.5"stroke="#141414"strokeWidth="0.3"/>
 <line x1="1.5"y1="-1.5"x2="-1.5"y2="1.5"stroke="#141414"strokeWidth="0.3"/>
 </g>

 {/* Ticket number - engraved style */}
 <text x="95"y="130"fontFamily="serif"fontSize="10"fill="#141414"fontWeight="700">№001</text>

 {/* Stippling along edges */}
 <circle cx="25"cy="80"r="0.4"fill="#141414"/>
 <circle cx="25"cy="90"r="0.3"fill="#141414"/>
 <circle cx="25"cy="100"r="0.4"fill="#141414"/>
 <circle cx="25"cy="110"r="0.3"fill="#141414"/>
 <circle cx="25"cy="120"r="0.4"fill="#141414"/>
 <circle cx="25"cy="130"r="0.3"fill="#141414"/>
 <circle cx="25"cy="140"r="0.4"fill="#141414"/>

 {/* Top edge decorative dots */}
 <circle cx="50"cy="58"r="0.4"fill="#141414"/>
 <circle cx="65"cy="58"r="0.4"fill="#141414"/>
 <circle cx="80"cy="58"r="0.4"fill="#141414"/>
 <circle cx="95"cy="58"r="0.4"fill="#141414"/>
 <circle cx="110"cy="58"r="0.4"fill="#141414"/>
 <circle cx="125"cy="58"r="0.4"fill="#141414"/>
 </svg>
 );
}
