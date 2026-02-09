import RaffleDetailClient from './RaffleDetailClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function RaffleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <RaffleDetailClient />;
}
