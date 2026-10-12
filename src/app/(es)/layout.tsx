import type { ReactNode } from 'react';
import '../globals.css';

export { viewport } from '../../site/meta';

// Root layout for the Spanish site: the html lang is fixed per route, so pages render statically.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="iso" data-theme="light">
        {children}
      </body>
    </html>
  );
}
