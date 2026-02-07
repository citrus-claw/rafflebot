import Image from 'next/image';

export function TentIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/carnival-tent.png"
      alt="Carnival tent illustration"
      width={size}
      height={size}
      className={className}
    />
  );
}
