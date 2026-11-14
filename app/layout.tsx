import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'LIVIO – Biglers Insektenschutz-Lotse',
  description: 'Pilot fuer die digitale Insektenschutz-Beratung der Schreinerei Bigler.',
  applicationName: 'BIGLER LIVIO',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: { capable: true, title: 'LIVIO', statusBarStyle: 'default' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
