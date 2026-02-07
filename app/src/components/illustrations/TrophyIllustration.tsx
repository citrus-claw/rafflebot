import Image from 'next/image';

export function TrophyIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/trophy.png"
      alt="Trophy illustration"
      width={size}
      height={size}
      className={className}
    />
  );
}
