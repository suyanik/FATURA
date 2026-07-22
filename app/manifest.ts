import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Yordanova Transport – Rechnungen',
    short_name: 'Rechnungen',
    description:
      'Rechnungssystem für Yordanova Transport – Rechnungen erstellen, verwalten und versenden.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f6f7f8',
    theme_color: '#0f172a',
    lang: 'de',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
