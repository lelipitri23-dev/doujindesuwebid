'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // [FIX] Menambahkan useEffect
import { useAuth } from '@/context/AuthContext';
import { TagsIcon } from 'lucide-react';

// ─── Icons ────────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GridIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BookmarkIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function HistoryIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" strokeLinecap="round" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

function GenreIcon({ active }) {
  return (
    <TagsIcon
      className="w-6 h-6"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
    />
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── User Menu Dropdown ───────────────────────────────────
function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent-red flex items-center justify-center text-white text-sm font-bold bg-accent-red/20"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{user.displayName?.[0] || user.email?.[0] || '?'}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-52 bg-bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-bold text-text-primary text-sm truncate">
                {user.displayName || 'Pengguna'}
              </p>
              <p className="text-text-muted text-xs truncate">{user.email}</p>
            </div>
            <Link href={`/user/${user.uid}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Profil Saya
            </Link>
            <Link href="/bookmarks" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
              Bookmark Saya
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Keluar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  // ==========================================
  // [FIX] STATE & LOGIKA NOTIFIKASI
  // ==========================================
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetch(`/api/proxy/users/${user.uid}/notifications`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setNotifications(data.data);
        })
        .catch(err => console.error("Gagal load notif:", err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;
    try {
      await fetch(`/api/proxy/users/${user.uid}/notifications/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };
  // ==========================================

  if (pathname.startsWith('/read/')) return null;
  if (pathname.startsWith('/login')) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/manga?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const NAV_ITEMS = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/manga', icon: GridIcon, label: 'All' },
    { href: '/genres', icon: GenreIcon, label: 'Genre' },
    { href: '/bookmarks', icon: BookmarkIcon, label: 'Simpan' },
    { href: '/history', icon: HistoryIcon, label: 'Riwayat' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-2xl text-accent-red tracking-wider">{process.env.NEXT_PUBLIC_SITE_NAME || 'DOUJINDESU'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-elevated border border-border text-text-secondary hover:border-accent-red hover:text-accent-red transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotif(!showNotif);
                    if (!showNotif) handleMarkAsRead();
                  }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-bg-elevated border border-border text-text-secondary hover:border-accent-red hover:text-accent-red transition-colors"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-red text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                    <div className="absolute right-0 top-11 z-50 w-72 md:w-80 bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-border bg-bg-elevated flex justify-between items-center">
                        <h3 className="font-bold text-text-primary text-sm">Notifikasi</h3>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-text-muted text-xs">Belum ada notifikasi.</div>
                        ) : (
                          notifications.map((notif, i) => (
                            <div key={i} className={`p-4 border-b border-border/50 hover:bg-bg-elevated transition-colors ${!notif.isRead ? 'bg-accent-red/5' : ''}`}>
                              <p className="text-xs font-bold text-text-primary mb-1">{notif.title}</p>
                              <p className="text-[11px] text-text-secondary leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] text-text-muted mt-2">{new Date(notif.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-red text-white text-xs font-bold hover:bg-accent-redDark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <form className="w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()} onSubmit={handleSearch}>
            <div className="flex items-center gap-3 bg-bg-card border border-border rounded-2xl px-4 py-3 shadow-2xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-muted flex-shrink-0"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input autoFocus type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Cari manga, manhwa, manhua..." className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-base" />
              {searchQ && (
                <button type="button" onClick={() => setSearchQ('')} className="text-text-muted hover:text-text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
            <p className="text-text-muted text-xs text-center mt-3">Tekan Enter untuk mencari • Tap di luar untuk tutup</p>
          </form>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            const needsAuth = href === '/bookmarks' || href === '/history';
            return (
              <Link key={href} href={needsAuth && !user ? '/login' : href} className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 transition-colors duration-200 relative ${active ? 'text-accent-red' : 'text-text-muted hover:text-text-secondary'}`}>
                <Icon active={active} />
                <span className={`text-[10px] font-semibold ${active ? 'text-accent-red' : 'text-text-muted'}`}>{label}</span>
                {needsAuth && !user && <span className="absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-accent-red" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}