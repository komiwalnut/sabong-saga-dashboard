'use client';

import dynamic from 'next/dynamic';

const TokenDashboard = dynamic(
  () => import('./components/TokenDashboard'),
  { ssr: false }
);

export default function TokenPage() {
  return <TokenDashboard />;
}