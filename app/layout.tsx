import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  title: 'FirstPlay | Arcade & Web Game Launcher',
  description: 'FirstPlay is the unified web game launcher and cross-game discovery network for players and indie studios.',
  icons: { icon: '/firstplay-logo.png', apple: '/firstplay-logo.png' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FirstPlay'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8f9fc'
};

// Force light mode permanently across all browsers and storage
const lightModeScript = `(function(){try{localStorage.setItem('fp-theme','light');document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

// Register PWA service worker
const pwaScript = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW register error',e);});});}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/firstplay-logo.png" />
        <script dangerouslySetInnerHTML={{ __html: lightModeScript }} />
        <script dangerouslySetInnerHTML={{ __html: pwaScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
