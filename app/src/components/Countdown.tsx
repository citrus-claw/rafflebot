"use client";

import { useEffect, useState } from "react";

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
    return <span className="text-red-500 font-medium">Ended</span>;
  }

  return (
    <div className="flex gap-2">
      <TimeBlock value={timeLeft.days} label="D" />
      <TimeBlock value={timeLeft.hours} label="H" />
      <TimeBlock value={timeLeft.minutes} label="M" />
      <TimeBlock value={timeLeft.seconds} label="S" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-gray-800 rounded px-2 py-1 min-w-[48px] text-center">
      <span className="text-white font-mono font-bold">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-gray-400 text-xs ml-1">{label}</span>
    </div>
  );
}
