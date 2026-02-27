'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getPublicBookmarks, calcBookmarkStats, READING_STATUS } from '@/lib/bookmarks';
import { getPublicProfile, updateBio } from '@/lib/profile';
import { useAuth } from '@/context/AuthContext';

// ─── Badge ────────────────────────────────────────────────
function Badge({ count }) {
  if (count >= 1000) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      {Math.floor(count / 1000)}K+ Komik
    </span>
  );
  if (count >= 100) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/50 text-purple-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2L2 9l10 13 10-13L12 2zm0 3.5L19 9l-7 9-7-9 7-7.5z"/></svg>
      Kolektor
    </span>
  );
  if (count >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 text-blue-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
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
            <svg viewBox="0 0 24 24" fill="#fbbf24" className="w-2.5 h-2.5 flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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

// ─── Tab Bar ──────────────────────────────────────────────
const TABS = [
  { key: 'all',                   label: 'Semua' },
  { key: READING_STATUS.READING,  label: 'Dibaca' },
  { key: READING_STATUS.TO_READ,  label: 'Mau Dibaca' },
  { key: READING_STATUS.FINISHED, label: 'Selesai' },
  { key: READING_STATUS.DROPPED,  label: 'Dihentikan' },
];

// ─── Edit Bio Modal ───────────────────────────────────────
function EditBioModal({ currentBio, onSave, onClose }) {
  const [bio, setBio]     = useState(currentBio || '');
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
  const { user }                    = useAuth();
  const [profile, setProfile]       = useState(null);
  const [bookmarks, setBookmarks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('all');
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
      // getPublicProfile dari backend mengembalikan { googleId, displayName, photoURL, bio, library, stats }
      // getPublicBookmarks mengambil library dari endpoint public-profile dan menormalisasinya
      const [profileData, bookmarkData] = await Promise.all([
        getPublicProfile(userId),
        getPublicBookmarks(userId),
      ]);
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
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                      ADMIN
                    </span>
                  ) : profile?.isPremium ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      PREMIUM
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/20 border border-gray-500/50 text-gray-300 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>
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
              <StatCard value={stats.reading}  label="Dibaca"      color="text-accent-red" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.toRead}   label="Mau Dibaca"  color="text-blue-400" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.finished} label="Selesai"     color="text-green-400" />
              <div className="w-px h-8 bg-border" />
              <StatCard value={stats.dropped}  label="Dihentikan"  color="text-gray-400" />
            </div>
          </div>
        </div>

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
                  className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30'
                      : 'bg-bg-card border border-border text-text-muted hover:border-accent-red/40 hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-bg-elevated text-text-muted'
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
