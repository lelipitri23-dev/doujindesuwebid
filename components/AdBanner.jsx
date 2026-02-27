'use client';

import { useEffect, useRef } from 'react';
import { ADS_CONFIG } from '@/lib/ads';
import { useAuth } from '@/context/AuthContext';

export default function AdBanner({ slot, className = '', sticky = false }) {
  const { user, loading } = useAuth();
  const adRef = useRef(null);
  const pushed = useRef(false);

  const network = ADS_CONFIG.NETWORK;
  const isAdSense = network === 'adsense';
  const slotId = ADS_CONFIG.ADSENSE?.SLOTS?.[slot] || '';
  const customHtml = ADS_CONFIG.CUSTOM?.SLOTS?.[slot] || '';

  // ─── LOGIKA TAMPIL IKLAN ──────────────────────────────────
  // Iklan TIDAK tampil jika:
  //   1. Fitur iklan dimatikan (ENABLED: false)
  //   2. Masih loading status user (cegah flicker)
  //   3. User adalah Admin    → user.isAdmin  === true
  //   4. User adalah Premium  → user.isPremium === true
  //
  // Iklan TAMPIL jika:
  //   - Guest (belum login)   → user === null
  //   - Member biasa          → user ada, tapi bukan admin & bukan premium
  // ─────────────────────────────────────────────────────────
  const shouldShowAds = (() => {
    if (!ADS_CONFIG.ENABLED) return false; // iklan dimatikan
    if (loading) return false; // tunggu status user
    if (!user) return true;  // guest → tampilkan
    if (user.isAdmin || user.isPremium) return false; // admin/premium → sembunyikan
    return true;                                   // member biasa → tampilkan
  })();

  useEffect(() => {
    if (!shouldShowAds || !isAdSense || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (_) { }
  }, [shouldShowAds, isAdSense]);

  if (!shouldShowAds) return null;
  if (isAdSense && !slotId) return null;
  if (!isAdSense && !customHtml) return null;

  const stickyClass = sticky
    ? 'fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-bg-primary/80 backdrop-blur-sm border-t border-border py-1'
    : '';

  if (isAdSense) {
    return (
      <div className={`ad-banner overflow-hidden text-center ${stickyClass} ${className}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADS_CONFIG.ADSENSE.CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`ad-banner overflow-hidden text-center ${stickyClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: customHtml }}
    />
  );
}