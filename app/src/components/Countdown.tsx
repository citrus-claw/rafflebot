"use client";

import { useEffect, useState } from"react";

interface CountdownProps {
 endTime: number;
}

export function Countdown({ endTime }: CountdownProps) {
 const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

 function calculateTimeLeft() {
 const difference = endTime - Date.now();
 if (difference <= 0) {
 return { days: 0, hours: 0, minutes: 0, seconds: 0 };
 }
 return {
 days: Math.floor(difference / (1000 * 60 * 60 * 24)),
 hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((difference / (1000 * 60)) % 60),
 seconds: Math.floor((difference / 1000) % 60),
 };
 }

 useEffect(() => {
 const timer = setInterval(() => {
 setTimeLeft(calculateTimeLeft());
 }, 1000);
 return () => clearInterval(timer);
 }, [endTime]);

 const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 &&
 timeLeft.minutes === 0 && timeLeft.seconds === 0;

 if (isExpired) {
 return <span className="text-carnival-red font-mono text-lg font-bold">DRAW TIME!</span>;
 }

 return (
 <div className="flex gap-2">
 <TimeBlock value={timeLeft.days} label="DAYS"/>
 <span className="text-gold/40 font-bold self-center text-xl">:</span>
 <TimeBlock value={timeLeft.hours} label="HRS"/>
 <span className="text-gold/40 font-bold self-center text-xl">:</span>
 <TimeBlock value={timeLeft.minutes} label="MIN"/>
 <span className="text-gold/40 font-bold self-center text-xl">:</span>
 <TimeBlock value={timeLeft.seconds} label="SEC"/>
 </div>
 );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
 return (
 <div className="bg-surface border-2 border-dashed border-ink rounded-sm px-3 py-2 min-w-[52px] text-center">
 <span className="text-gold font-mono font-bold text-xl block leading-none">
 {value.toString().padStart(2,"0")}
 </span>
 <span className="text-ink/30 text-[9px] font-bold tracking-widest mt-1 block">
 {label}
 </span>
 </div>
 );
}
