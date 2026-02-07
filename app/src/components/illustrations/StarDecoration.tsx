import Image from 'next/image';

export function StarDecoration({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/stars.png"
      alt="Stars decoration"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function Bunting({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/illustrations/ferris-wheel.png"
      alt="Ferris wheel decoration"
      width={200}
      height={200}
      className={`opacity-20 ${className}`}
    />
  );
}

export function FerrisWheel({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/ferris-wheel.png"
      alt="Ferris wheel illustration"
      width={size}
      height={size}
      className={className}
    />
  );
}
