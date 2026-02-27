'use client';

import Script from 'next/script';
import { ADS_CONFIG } from '@/lib/ads';
import { useAuth } from '@/context/AuthContext';

export default function AdScript() {
  const { user, loading } = useAuth();

  // ─── LOGIKA MUAT SCRIPT IKLAN ─────────────────────────────
  // Script TIDAK dimuat jika:
  //   1. Fitur iklan dimatikan
  //   2. Masih loading status user
  //   3. User adalah Admin atau Premium
  //
  // Script DIMUAT jika:
  //   - Guest (belum login) → tampilkan iklan
  //   - Member biasa        → tampilkan iklan
  // ─────────────────────────────────────────────────────────
  const shouldLoadScript = (() => {
    if (!ADS_CONFIG.ENABLED) return false;
    if (loading) return false;
    if (!user) return true;  // guest
    if (user.isAdmin || user.isPremium) return false; // admin/premium
    return true;                                      // member biasa
  })();

  if (!shouldLoadScript) return null;

  const network = ADS_CONFIG.NETWORK;

  if (network === 'adsense' && ADS_CONFIG.ADSENSE?.CLIENT_ID) {
    return (
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.ADSENSE.CLIENT_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    );
  }

  if ((network === 'adsterra' || network === 'custom') && ADS_CONFIG.CUSTOM?.GLOBAL_SCRIPT) {
    return (
      <div
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: ADS_CONFIG.CUSTOM.GLOBAL_SCRIPT }}
      />
    );
  }

  return null;
}