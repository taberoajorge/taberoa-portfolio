import { Analytics } from '@vercel/analytics/next';
import type { ReactNode } from 'react';
import '../globals.css';

export { viewport } from '../../site/meta';

// Root layout for the English site: the html lang is fixed per route, so pages render statically.
// Web Analytics mounts only on Vercel: elsewhere its script does not exist and the 404 would count as a
// console error in Lighthouse.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="iso" data-theme="light">
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
