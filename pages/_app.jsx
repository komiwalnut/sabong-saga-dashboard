import '../index.css';
import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
