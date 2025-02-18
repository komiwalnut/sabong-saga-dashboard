'use client';

import dynamic from 'next/dynamic';

const FeatherDashboard = dynamic(
  () => import('./components/FeatherDashboard'),
  { ssr: false }
);

export default function FeatherPage() {
  return <FeatherDashboard />;
}