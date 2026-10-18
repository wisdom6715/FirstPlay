import '../index.css';
import FirstPlayClientProvider from '../components/FirstPlayClientProvider';

export const metadata = {
  metadataBase: new URL('https://firstplay.fun'),
  title: 'FirstPlay — African Web Games & Digital Experiences | Play Lagos Life, Danfo Run, Monkey Post',
  description: 'Discover and play curated Nigerian and African browser games instantly with zero installation. Experience Lagos Life, Danfo Run, Monkey Post, myAbuja Life, and trending Naija web games on any device.',
  keywords: [
    'Lagos Life',
    'Danfo Run',
    'Monkey Post',
    'myAbuja Life',
    'Naija games',
    'Nigerian games',
    'African web games',
    'play games online Nigeria',
    'African gaming platform',
    'browser games Lagos',
    'instant play web games',
    'HTML5 African games',
    'free online games Nigeria'
  ],
  authors: [{ name: 'FirstPlay' }],
  creator: 'FirstPlay',
  publisher: 'FirstPlay',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://firstplay.fun/',
  },
  openGraph: {
    siteName: 'FirstPlay',
    type: 'website',
    title: 'FirstPlay — Play Lagos Life, Danfo Run, Monkey Post & Naija Games Online',
    description: 'Discover and play curated Nigerian and African browser games instantly with zero install. Experience Lagos Life, Danfo Run, Monkey Post, and top indie games on any device.',
    url: 'https://firstplay.fun/',
    locale: 'en_NG',
    alternateLocale: ['en_US', 'en_GB'],
    images: [
      {
        url: 'https://firstplay.fun/firstplay_x_cover.jpg',
        width: 1200,
        height: 630,
        alt: 'FirstPlay - African and Naija Web Games featuring Lagos Life, Danfo Run, and Monkey Post',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FirstPlayApp',
    creator: '@FirstPlayApp',
    title: 'FirstPlay — Play Lagos Life, Danfo Run, Monkey Post & Naija Games Online',
    description: 'Play the best Nigerian and African browser games directly in your browser with zero install. Lagos Life, Danfo Run, Monkey Post & more.',
    images: ['https://firstplay.app/firstplay_x_cover.jpg'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FirstPlay',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'geo.region': 'NG-LA',
    'geo.placename': 'Lagos, Nigeria',
    'geo.position': '6.5244;3.3792',
    'ICBM': '6.5244, 3.3792',
    'al:web:url': 'https://firstplay.app/',
    'al:web:should_fallback': 'true',
  },
};

export const viewport = {
  themeColor: '#f5f5f7',
  width: 'device-width',
  initialScale: 1,
};

const jsonLdData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FirstPlay',
    alternateName: ['FirstPlay Games', 'FirstPlay Web', 'FirstPlay Africa'],
    url: 'https://firstplay.app/',
    description: 'Discover and play curated Nigerian and African browser games instantly with zero installation.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://firstplay.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FirstPlay',
    url: 'https://firstplay.app/',
    logo: 'https://firstplay.app/icon-512.png',
    sameAs: [
      'https://x.com/FirstPlayApp',
      'https://instagram.com/FirstPlayApp',
      'https://tiktok.com/@firstplayapp',
      'https://facebook.com/FirstPlayApp'
    ]
  }
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="bg-[#f5f5f7] text-[#1d1d1f] antialiased select-none overflow-hidden m-0 p-0 font-sans">
        <FirstPlayClientProvider>
          {children}
        </FirstPlayClientProvider>
      </body>
    </html>
  );
}
