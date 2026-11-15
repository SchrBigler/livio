import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BIGLER LIVIO – Insektenschutz',
    short_name: 'LIVIO',
    description: 'Insektenschutz nach Mass – einfach online planen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#075553',
    theme_color: '#075553',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
}
