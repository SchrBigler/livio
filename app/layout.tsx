import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'BIGLER LIVIO – Insektenschutz',
  description: 'Insektenschutz gemeinsam planen: Fenster und Türen erfassen, Fotos prüfen und persönliche Fachberatung bei Schreinerei Bigler erhalten.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
