import type { Metadata, Viewport } from 'next';
import { PwaServiceWorker } from '@/components/pwa-service-worker';
import { AppShell } from '@/layouts/app-shell';
import './globals.css';

export function generateMetadata(): Metadata {
  const baseMetadata: Metadata = {
    title: 'MOVI | Mobilidade urbana',
    description: 'Plataforma premium de transporte urbano para São Francisco do Sul - SC.',
    applicationName: 'MOVI',
    appleWebApp: {
      capable: true,
      title: 'MOVI',
      statusBarStyle: 'default',
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icons/cityline-icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
        { url: '/icons/cityline-icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/icons/cityline-icon-180.svg', sizes: '180x180', type: 'image/svg+xml' }],
    },
  };

  // Em desenvolvimento, evitamos rota de manifest para reduzir instabilidade de hot reload/chunks.
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseMetadata,
      manifest: '/manifest.webmanifest',
    };
  }

  return baseMetadata;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14233C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className="font-sans">
        <AppShell>{children}</AppShell>
        <PwaServiceWorker />
      </body>
    </html>
  );
}
