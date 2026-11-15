import type { Metadata } from 'next';
import './styles.css';
import MarketingConsent from './marketing-consent';

export const metadata: Metadata = {
  title: 'BIGLER LIVIO – Insektenschutz',
  description: 'Insektenschutz gemeinsam planen: Fenster und Türen erfassen, Fotos prüfen und persönliche Fachberatung bei Schreinerei Bigler erhalten.',
  applicationName: 'BIGLER LIVIO',
  manifest: '/manifest.webmanifest',
  icons: {icon: [{url:'/icon.svg',type:'image/svg+xml'}], shortcut:'/icon.svg', apple:[{url:'/apple-icon',sizes:'180x180',type:'image/png'}]},
  appleWebApp: {capable:true,title:'LIVIO',statusBarStyle:'default'}

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}<MarketingConsent/></body>
    </html>
  );
}
