'use client';

import dynamic from 'next/dynamic';

const TokenHoldersDashboard = dynamic(
  () => import('./components/Dashboard'),
  { ssr: false }
);

export default function Home() {
  return <TokenHoldersDashboard />;
}