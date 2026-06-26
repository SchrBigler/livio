import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'LIVIO – Biglers Insektenschutz-Lotse',
  description: 'Pilot fuer die digitale Insektenschutz-Beratung der Schreinerei Bigler.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
