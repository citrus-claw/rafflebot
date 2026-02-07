import Image from 'next/image';

export function TicketIllustration({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/illustrations/ticket-stub.png"
      alt="Ticket illustration"
      width={size}
      height={size}
      className={className}
    />
  );
}
