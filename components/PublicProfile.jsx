'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { normalizeLibraryItem, calcBookmarkStats, READING_STATUS } from '@/lib/bookmarks';
import { getPublicProfile, updateBio } from '@/lib/profile';
import { useAuth } from '@/context/AuthContext';

// ─── Badge ────────────────────────────────────────────────
function Badge({ count }) {
  if (count >= 1000) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      {Math.floor(count / 1000)}K+ Komik
    </span>
  );
  if (count >= 100) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/50 text-purple-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2L2 9l10 13 10-13L12 2zm0 3.5L19 9l-7 9-7-9 7-7.5z" /></svg>
      Kolektor
    </span>
  );
  if (count >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 text-blue-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
      Pembaca Aktif
    </span>
  );
  return null;
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
      <span className={`font-display text-xl font-bold ${color}`}>{value}</span>
      <span className="text-text-muted text-[10px] font-medium leading-tight text-center">{label}</span>
    </div>
  );
}

// ─── Manga Card ───────────────────────────────────────────
// b = item yang sudah dinormalisasi (punya field: slug, coverImage, title, type, status, rating)
function MangaCard({ bookmark: b }) {
  const typeColor = b.type?.toLowerCase() === 'manhwa' ? 'bg-purple-900/50 text-purple-300' : 'bg-orange-900/50 text-orange-300';

  return (
    <Link href={`/manga/${b.slug}`} className="group flex flex-col gap-1.5">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-elevated border border-border group-hover:border-accent-red/50 transition-colors">
        {b.coverImage ? (
          <img
            src={b.coverImage}
            alt={b.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 12h8M8 17h5" />
            </svg>
          </div>
        )}
        <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${typeColor}`}>
          {b.type || 'M'}
        </div>
        {b.rating > 0 && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/70 rounded-md px-1.5 py-0.5">
            <svg viewBox="0 0 24 24" fill="#fbbf24" className="w-2.5 h-2.5 flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span className="text-white text-[10px] font-bold">{Number(b.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="text-text-primary text-[11px] font-semibold line-clamp-2 leading-tight px-0.5">
        {b.title}
      </p>
      <div className="flex items-center gap-1 px-0.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.status?.toLowerCase() === 'ongoing' ? 'bg-green-400' : 'bg-gray-400'}`} />
        <span className="text-text-muted text-[10px]">{b.status || 'Ongoing'}</span>
      </div>
    </Link>
  );
}

// ─── AccountInfoCard ─────────────────────────────────────────
function AccountInfoCard({ profile, onGenerateTelegramCode, onClaimTrial }) {
  const downloadUsed = profile?.downloadUsed ?? null;
  const downloadLimit = profile?.downloadLimit ?? 6;
  const remaining = downloadUsed !== null ? Math.max(0, downloadLimit - downloadUsed) : null;
  const pct = downloadUsed !== null ? Math.max(0, Math.min(100, (remaining / downloadLimit) * 100)) : 0;
  const isUnlimited = profile?.isPremium || profile?.isAdmin;

  const createdAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const premiumUntil = profile?.premiumUntil
    ? new Date(profile.premiumUntil)
    : null;
  const premiumExpired = premiumUntil ? new Date() > premiumUntil : false;
  const premiumLabel = premiumUntil
    ? premiumExpired
      ? 'Premium Kadaluarsa'
      : premiumUntil.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : profile?.isPremium ? 'Seumur Hidup' : null;

  // Hari tersisa premium
  const premiumDaysLeft = premiumUntil && !premiumExpired
    ? Math.ceil((premiumUntil - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="mx-4 mt-4 bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-accent-red">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Info Akun</span>
      </div>

      <div className="p-4 space-y-4">

        {/* Download Limit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-text-muted">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Download Hari Ini</span>
            </div>
            {isUnlimited ? (
              <span className="text-[11px] font-bold text-yellow-400">∞ Tanpa Batas</span>
            ) : downloadUsed !== null ? (
              <span className={`text-[11px] font-bold ${remaining === 0 ? 'text-red-400' : remaining <= 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                {remaining}/{downloadLimit} tersisa
              </span>
            ) : (
              <span className="text-[11px] text-text-muted">-</span>
            )}
          </div>
          {!isUnlimited && downloadUsed !== null && (
            <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${remaining === 0 ? 'bg-red-500' : remaining <= 2 ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          {!isUnlimited && (
            <p className="text-[10px] text-text-muted mt-1.5">Reset otomatis setiap hari pukul 00:00.</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Status Premium */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status Premium</span>
          </div>
          <div className="text-right flex flex-col items-end">
            {profile?.isAdmin ? (
              <span className="text-[11px] font-bold text-red-400">Admin (Unlimited)</span>
            ) : profile?.isPremium && !premiumExpired ? (
              <div>
                <span className="text-[11px] font-bold text-yellow-400">Aktif</span>
                {premiumLabel && (
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {premiumDaysLeft !== null ? `${premiumDaysLeft} hari lagi · ` : ''}Exp: {premiumLabel}
                  </p>
                )}
              </div>
            ) : premiumExpired ? (
              <div>
                <span className="text-[11px] font-bold text-red-400">Kadaluarsa</span>
                {premiumLabel && <p className="text-[10px] text-text-muted mt-0.5">{premiumLabel}</p>}
              </div>
            ) : (
              <span className="text-[11px] text-text-muted">Tidak Aktif</span>
            )}

            {/* BUTTON CLAIM TRIAL */}
            {profile && !profile.hasUsedTrial && !profile.isAdmin && (!profile.isPremium || premiumExpired) && (
              <button
                onClick={onClaimTrial}
                className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all active:scale-95 flex items-center gap-1"
              >
                <span>🎁 Klaim Trial 2 Hari GRATIS!</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Tanggal Bergabung */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-text-muted">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Bergabung</span>
          </div>
          <span className="text-[11px] font-semibold text-text-secondary">
            {createdAt || '—'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Telegram Sync */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Telegram Bot</span>
          </div>

          <div className="flex items-center justify-between">
            {profile?.telegramId ? (
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 w-full text-center">
                Terhubung ({profile.telegramId})
              </span>
            ) : profile?.telegramSyncCode ? (
              <div className="flex flex-col gap-1 w-full relative">
                <span className="text-[10px] text-text-muted">Kode Login Bot Anda:</span>
                <div className="flex items-center justify-between bg-bg-elevated rounded-xl p-2.5 border border-border">
                  <span className="font-mono font-bold text-white text-lg tracking-widest">{profile.telegramSyncCode}</span>
                  <button onClick={onGenerateTelegramCode} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold px-2 py-1 bg-blue-500/10 rounded-lg transition-colors">Regenerate</button>
                </div>
                <span className="text-[10px] text-text-muted mt-1 leading-tight">Cari bot Doujindesu di Telegram dan kirim pesan <b className="text-text-primary">/login {profile.telegramSyncCode}</b></span>
              </div>
            ) : (
              <button
                onClick={onGenerateTelegramCode}
                className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/20 transition-colors flex items-center justify-center gap-2"
              >
                Hubungkan Telegram
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
const TABS = [
  { key: 'all', label: 'Semua' },
  { key: READING_STATUS.READING, label: 'Dibaca' },
  { key: READING_STATUS.TO_READ, label: 'Mau Dibaca' },
  { key: READING_STATUS.FINISHED, label: 'Selesai' },
  { key: READING_STATUS.DROPPED, label: 'Dihentikan' },
];

// ─── Edit Bio Modal ───────────────────────────────────────
function EditBioModal({ currentBio, onSave, onClose }) {
  const [bio, setBio] = useState(currentBio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(bio);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-bg-card border border-border rounded-2xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-text-primary text-base mb-3">Edit Bio</h3>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={100}
          rows={3}
          placeholder="Tulis sesuatu tentang dirimu..."
          className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm outline-none focus:border-accent-red resize-none placeholder-text-muted"
        />
        <p className="text-text-muted text-[11px] mt-1 text-right">{bio.length}/100</p>
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:border-accent-red/50 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent-red text-white text-sm font-bold hover:bg-accent-redDark transition-colors disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function PublicProfile({ userId }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showEditBio, setShowEditBio] = useState(false);
  const tabsRef = useRef(null);

  const isOwn = user?.uid === userId;

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Ambil public profile sekali, lalu normalisasi library jadi data bookmark.
      const profileData = await getPublicProfile(userId);
      const bookmarkData = (profileData?.library || []).map(normalizeLibraryItem).filter(Boolean);
      setProfile(profileData);
      setBookmarks(bookmarkData);
    } catch (err) {
      console.error('[PublicProfile] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async (bio) => {
    await updateBio(userId, bio);
    setProfile(prev => ({ ...prev, bio }));
  };

  const handleGenerateTelegramCode = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/telegram-sync`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        setProfile(prev => ({
          ...prev,
          telegramSyncCode: json.data.telegramSyncCode,
          telegramId: json.data.telegramId
        }));
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat kode sync Telegram');
    }
  };

  const handleClaimTrial = async () => {
    if (!isOwn || !user?.uid) return;

    if (!window.confirm('Klaim Premium Gratis 2 Hari sekarang? Waktu premium akan langsung aktif dan terhitung mundur.')) return;

    try {
      const res = await fetch('/api/users/claim-trial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.uid}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        loadProfile(); // reload profile to reflect changes
        // Optionally force reload User context in memory by reloading the page
        window.location.reload();
      } else {
        alert(data.message || 'Gagal mengklaim trial.');
      }
    } catch (err) {
      console.error('Klaim error:', err);
      alert('Gagal mengklaim trial.');
    }
  };

  const stats = calcBookmarkStats(bookmarks);
  const total = bookmarks.length;

  const filtered = activeTab === 'all'
    ? bookmarks
    : bookmarks.filter(b => (b.readingStatus || READING_STATUS.READING) === activeTab);

  const tabCount = (key) => {
    if (key === 'all') return total;
    return bookmarks.filter(b => (b.readingStatus || READING_STATUS.READING) === key).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !loading && bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="pt-24 flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-text-muted">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="font-display text-xl text-text-secondary tracking-wider">PENGGUNA TIDAK DITEMUKAN</p>
          <p className="text-text-muted text-sm">Profil ini tidak ada atau belum pernah login.</p>
          <Link href="/" className="mt-2 px-6 py-3 bg-accent-red text-white font-bold rounded-xl text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.displayName || 'Pengguna';
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {showEditBio && (
        <EditBioModal
          currentBio={profile?.bio}
          onSave={handleSaveBio}
          onClose={() => setShowEditBio(false)}
        />
      )}

      <main className="pt-14 pb-24 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="relative mx-4 mt-5 bg-bg-card border border-border rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/5 via-transparent to-purple-900/10 pointer-events-none" />
          <div className="relative p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-accent-red/50 shadow-lg shadow-accent-red/10">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-red/30 to-purple-900/50 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl text-text-primary tracking-wide leading-none">{displayName}</h1>

                  {/* BADGE MEMBERSHIP DARI DATABASE */}
                  {profile?.isAdmin ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                      ADMIN
                    </span>
                  ) : profile?.isPremium ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      PREMIUM
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/20 border border-gray-500/50 text-gray-300 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      MEMBER
                    </span>
                  )}

                  {isOwn && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-red/20 border border-accent-red/40 text-accent-red ml-auto">
                      KAMU
                    </span>
                  )}
                </div>
                <p className="text-text-muted text-xs font-semibold mt-0.5">{handle}</p>

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Badge count={total} />
                  {stats.finished >= 10 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 border border-green-500/50 text-green-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Finisher
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-start gap-1.5">
                  <p className="text-text-muted text-xs italic flex-1 leading-relaxed">
                    {profile?.bio
                      ? `"${profile.bio}"`
                      : isOwn ? 'Belum ada bio. Klik edit untuk menambahkan.' : ''}
                  </p>
                  {isOwn && (
                    <button
                      onClick={() => setShowEditBio(true)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent-red/50 hover:text-accent-red transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-around">
              <StatCard value={stats.reading} label="Dibaca" color="text-accent-red" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.toRead} label="Mau Dibaca" color="text-blue-400" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.finished} label="Selesai" color="text-green-400" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.dropped} label="Dihentikan" color="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Account Info — hanya tampil untuk owner */}
        {isOwn && <AccountInfoCard profile={profile} onGenerateTelegramCode={handleGenerateTelegramCode} onClaimTrial={handleClaimTrial} />}

        {/* Bookmarks Section */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base text-text-primary tracking-widest">BOOKMARKS</h2>
            <span className="text-text-muted text-xs font-semibold">{total} Komik</span>
          </div>

          {/* Tabs */}
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4 -mx-1 px-1">
            {TABS.map(tab => {
              const count = tabCount(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.key
                    ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30'
                    : 'bg-bg-card border border-border text-text-muted hover:border-accent-red/40 hover:text-text-secondary'
                    }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-bg-elevated text-text-muted'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 bg-bg-elevated rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-text-muted">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="text-text-secondary font-semibold text-sm">Tidak ada komik di sini</p>
              {isOwn && activeTab === 'all' && (
                <Link href="/manga" className="mt-1 px-5 py-2.5 bg-accent-red text-white font-bold rounded-xl text-sm hover:bg-accent-redDark transition-colors">
                  Jelajahi Komik
                </Link>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map(b => (
                <MangaCard key={b.slug} bookmark={b} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
