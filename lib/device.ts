'use client';

import { useEffect, useState } from 'react';

export type DeviceOS = 'android' | 'ios' | 'macos' | 'windows' | 'linux' | 'other';
export type DeviceType = 'mobile' | 'laptop';

export interface DeviceInfo {
  os: DeviceOS;
  isMobile: boolean;
  isLaptop: boolean;
  isReady: boolean;
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.firstplay.launcher';
const APP_STORE_URL = 'https://apps.apple.com/app/firstplay/id6449123456';
const WINDOWS_DOWNLOAD_URL = '/downloads/FirstPlay-Setup.exe';
const MACOS_DOWNLOAD_URL = '/downloads/FirstPlay-macOS.dmg';

/**
 * Detect client device OS and type safely on mount without hydration mismatch.
 */
export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<DeviceInfo>({
    os: 'windows',
    isMobile: false,
    isLaptop: true,
    isReady: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Check for mobile indicators
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchMac = maxTouchPoints > 1 && /Macintosh/i.test(ua); // iPad claiming to be Mac
    const isMobileDevice = mobileRegex.test(ua) || isTouchMac || window.innerWidth < 768;

    let detectedOS: DeviceOS = 'other';

    if (/Android/i.test(ua)) {
      detectedOS = 'android';
    } else if (/iPhone|iPad|iPod/i.test(ua) || isTouchMac) {
      detectedOS = 'ios';
    } else if (/Macintosh|Mac OS X|MacPPC|MacIntel/i.test(ua) || /Mac/i.test(platform)) {
      detectedOS = 'macos';
    } else if (/Win32|Win64|Windows|WinCE/i.test(ua) || /Win/i.test(platform)) {
      detectedOS = 'windows';
    } else if (/Linux/i.test(ua)) {
      detectedOS = 'linux';
    }

    setDevice({
      os: detectedOS,
      isMobile: isMobileDevice,
      isLaptop: !isMobileDevice,
      isReady: true
    });
  }, []);

  return device;
}

/**
 * Action handler for the "Get FirstPlay" button:
 * - Redirects to Play Store on Android
 * - Redirects to App Store on iOS and macOS
 * - Downloads on Windows
 */
export function handleGetFirstPlay(os?: DeviceOS) {
  if (typeof window === 'undefined') return;

  const currentOS = os || detectOSDirect();

  if (currentOS === 'android') {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  } else if (currentOS === 'ios' || currentOS === 'macos') {
    window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
  } else if (currentOS === 'windows') {
    triggerWindowsDownload();
  } else {
    // Fallback for linux/other
    const downloadSec = document.getElementById('download');
    if (downloadSec) {
      downloadSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
    }
  }
}

/**
 * Triggers Windows file download with client-side feedback.
 */
export function triggerWindowsDownload() {
  if (typeof window === 'undefined') return;

  // Create an invisible download trigger
  const link = document.createElement('a');
  link.href = WINDOWS_DOWNLOAD_URL;
  link.download = 'FirstPlay-Setup.exe';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Notify the user via an unobtrusive notification pill
  showDownloadToast('Downloading FirstPlay for Windows (FirstPlay-Setup.exe)...');
}

/**
 * Triggers macOS file download with client-side feedback.
 */
export function triggerMacDownload() {
  if (typeof window === 'undefined') return;

  window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
  showDownloadToast('Redirecting to the Mac App Store...');
}

function showDownloadToast(message: string) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('fp-download-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'fp-download-toast';
  toast.className =
    'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-4';
  toast.innerHTML = `
    <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function detectOSDirect(): DeviceOS {
  if (typeof window === 'undefined') return 'windows';
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Windows/i.test(ua)) return 'windows';
  return 'other';
}
