'use client';

import { triggerMacDownload, triggerWindowsDownload, useDevice } from '@/lib/device';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.firstplay.launcher';
const APP_STORE_URL = 'https://apps.apple.com/app/firstplay/id6449123456';

export function DownloadSection() {
  const device = useDevice();

  const allPlatforms = [
    {
      id: 'app-store',
      name: 'App Store',
      subtitle: 'iOS • iPhone & iPad',
      isMobilePlatform: true,
      icon: (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#007aff] text-white shadow-sm">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.76 1 .08 2.02-.49 2.64-1.24z" />
          </svg>
        </div>
      ),
      onDownload: () => {
        window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'google-play',
      name: 'Google PlayStore',
      subtitle: 'Android Phones & Tablets',
      isMobilePlatform: true,
      icon: (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.2L3.7 1.7l-.1.1z"
              fill="#00E676"
            />
            <path
              d="M16.9 15.6l-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.6 0 2.2l-3.9 2.2-.1.1z"
              fill="#FFD600"
            />
            <path
              d="M13.6 12.1L3.6 22.1c.4.4 1 .4 1.7 0l11.6-6.6-3.3-3.4z"
              fill="#FF1744"
            />
            <path
              d="M13.6 11.9l3.3-3.4L5.3 1.9C4.6 1.5 4 1.5 3.6 1.9l10 10z"
              fill="#00B0FF"
            />
          </svg>
        </div>
      ),
      onDownload: () => {
        window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'windows',
      name: 'Windows',
      subtitle: 'PC App • x64 & ARM',
      isMobilePlatform: false,
      icon: (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-[#00a4ef] border border-sky-100 shadow-sm">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.75-1.523L24 0v11.551H10.75V1.926zM0 12.551h9.75V22l-9.75-1.349V12.551zm10.75 0H24V24l-13.25-1.926V12.551z" />
          </svg>
        </div>
      ),
      onDownload: () => {
        triggerWindowsDownload();
      }
    },
    {
      id: 'macos',
      name: 'macOS',
      subtitle: 'Universal • Apple Silicon & Intel',
      isMobilePlatform: false,
      icon: (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 shadow-sm">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.76 1 .08 2.02-.49 2.64-1.24z" />
          </svg>
        </div>
      ),
      onDownload: () => {
        triggerMacDownload();
      }
    }
  ];

  // In the download section, all OSs are listed on laptops, but ONLY App Store and Play Store are listed on mobiles
  const visiblePlatforms = device.isMobile
    ? allPlatforms.filter((p) => p.isMobilePlatform)
    : allPlatforms;

  return (
    <section id="download" className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Take FirstPlay with you.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal">
          {device.isMobile
            ? 'Discover and access your favorite games right on your phone or tablet.'
            : 'Discover and access your favorite games wherever you play.'}
        </p>

        {/* Platform Download Cards */}
        <div
          className={`mt-10 sm:mt-12 grid gap-5 sm:gap-6 ${
            device.isMobile
              ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {visiblePlatforms.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-1 flex flex-col items-center justify-between text-center"
            >
              <div className="flex flex-col items-center">
                {p.icon}
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {p.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {p.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={p.onDownload}
                className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-200 active:scale-95"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
