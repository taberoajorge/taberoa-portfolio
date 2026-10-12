import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://taberoa.com'),
  title: 'Alex Taberoa — Software Engineer',
  description:
    'Alex Taberoa: Software Engineer con trabajo público en herramientas de software y automatización.',
  keywords: ['Alex Taberoa', 'Software Engineer', 'software development', 'open source'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Alex Taberoa — Software Engineer',
    description: 'Trabajo público, decisiones técnicas y proyectos de software de Alex Taberoa.',
    url: 'https://taberoa.com',
    siteName: 'Alex Taberoa',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Alex Taberoa',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#17201c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
