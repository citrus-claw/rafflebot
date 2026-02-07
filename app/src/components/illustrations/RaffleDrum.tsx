import Image from 'next/image';

export function RaffleDrum({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/raffle-drum.png"
      alt="Raffle drum illustration"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
