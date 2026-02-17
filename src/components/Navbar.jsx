'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Tambahkan useSearchParams di import
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Bookmark, Menu, X, Home, Compass, Layers, ChevronDown, User, LogIn } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk membaca query URL

  // Pantau status login user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Perbaikan fungsi isActive
  const isActive = (path) => {
    // Logic dropdown active state menggunakan searchParams.has()
    if (path === 'type' && pathname.includes('/list') && searchParams.has('type')) {
      return 'text-primary font-bold';
    }
    if (path === '/' && pathname === '/') return 'text-primary font-bold';

    // Logic active state biasa
    return pathname.startsWith(path) && path !== '/'
      ? 'text-primary font-bold'
      : 'text-gray-300 hover:text-primary';
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.q.value;
    if (query) {
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      router.push(`/list?q=${encodeURIComponent(query)}`);
    }
  };

  const handleUserClick = () => {
    if (user) {
      router.push('/bookmark');
    } else {
      setShowAuthModal(true);
    }
  };

  const types = [
    { name: 'Manga', href: '/list?type=Manga' },
    { name: 'Manhwa', href: '/list?type=Manhwa' },
    { name: 'Doujinshi', href: '/list?type=Doujinshi' },
  ];

  return (
    <>
      <nav className="bg-card border-b border-gray-800 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-white flex items-center gap-1 flex-shrink-0">
            <span className="bg-primary px-2 rounded text-white uppercase">
              {SITE_CONFIG.name.slice(0, 5)}
            </span>
            <span className="uppercase">
              {SITE_CONFIG.name.slice(5)}
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex items-center bg-darker rounded-full px-4 py-2 border border-gray-700 focus-within:border-primary transition w-full">
              <input
                name="q"
                type="text"
                placeholder="Cari komik, manhwa..."
                className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-gray-500"
                autoComplete="off"
              />
              <button type="submit" aria-label="Search">
                <Search className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </form>

            <button
              onClick={handleUserClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition ${user ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-darker border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'}`}
            >
              {user ? <User size={18} /> : <LogIn size={18} />}
              <span className="text-sm font-bold hidden lg:inline">{user ? 'Akun' : 'Masuk'}</span>
            </button>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
            <Link href="/" className={`${pathname === '/' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition`}>Home</Link>
            <Link href="/list" className={`${pathname === '/list' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition`}>Daftar Komik</Link>

            <div className="relative group h-full flex items-center cursor-pointer">
              <span className={`flex items-center gap-1 transition ${isActive('type')}`}>
                Type <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 bg-card border border-gray-800 shadow-xl rounded-lg py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-t border-l border-gray-800 rotate-45"></div>
                <div className="relative z-10 bg-card rounded-lg overflow-hidden">
                  {types.map((type) => (
                    <Link key={type.name} href={type.href} className="block px-4 py-2 text-sm text-gray-300 hover:bg-darker hover:text-primary transition">
                      {type.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/bookmark" className={`${pathname === '/bookmark' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition flex items-center gap-1`}>
              <Bookmark size={16} /> Bookmark
            </Link>
          </div>

          {/* Tombol Search & Login Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              {isSearchOpen ? <X size={24} /> : <Search size={24} />}
            </button>
            <button onClick={handleUserClick} className={`focus:outline-none ${user ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>
              {user ? <User size={24} /> : <LogIn size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar Mobile */}
        {isSearchOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-card border-b border-gray-800 p-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="flex items-center bg-darker rounded-lg px-4 py-3 border border-gray-700">
              <input name="q" type="text" placeholder="Mau baca apa?" className="bg-transparent text-sm text-white focus:outline-none w-full" autoFocus />
              <button type="submit"><Search className="w-5 h-5 text-gray-400" /></button>
            </form>
          </div>
        )}
      </nav>

      {/* === Bottom Navigation (Mobile) === */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-800 z-50 pb-safe">
        <div className="grid grid-cols-4 h-16 items-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition">
            <Home size={22} className={isActive('/')} />
            <span className={`text-[10px] font-medium ${isActive('/')}`}>Home</span>
          </Link>
          <Link href="/list" className="flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition">
            <Compass size={22} className={isActive('/list')} />
            <span className={`text-[10px] font-medium ${isActive('/list')}`}>Explore</span>
          </Link>
          <Link href="/bookmark" className="flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition">
            <Bookmark size={22} className={isActive('/bookmark')} />
            <span className={`text-[10px] font-medium ${isActive('/bookmark')}`}>Library</span>
          </Link>
          <button onClick={toggleMenu} className="flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition focus:outline-none">
            <Layers size={22} className={isMenuOpen ? 'text-primary' : 'text-gray-400'} />
            <span className={`text-[10px] font-medium ${isMenuOpen ? 'text-primary' : 'text-gray-400'}`}>Menu</span>
          </button>
        </div>
      </div>

      {/* Menu Overlay Mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute bottom-16 left-0 w-full bg-card border-t border-gray-800 rounded-t-2xl p-6 animate-in slide-in-from-bottom-10 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Filter Tipe</h3>
              <button onClick={() => setIsMenuOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {types.map((type) => (
                <Link
                  key={type.name}
                  href={type.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 bg-darker border border-gray-700 rounded-lg hover:border-primary hover:text-primary transition"
                >
                  <span className="text-sm font-medium text-gray-300">{type.name}</span>
                </Link>
              ))}
            </div>

            {user && (
              <button
                onClick={() => { signOut(auth); setIsMenuOpen(false); }}
                className="mt-6 w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20"
              >
                Logout ({user.email.split('@')[0]})
              </button>
            )}

            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-xs text-center text-gray-500">
                {SITE_CONFIG.name} Mobile v1.0
              </p>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Iklan Header - Dioptimasi untuk Tailwind & Next.js */}
      <div className="w-full flex justify-center py-4 bg-background"> 
        <div className="relative overflow-hidden rounded-md shadow-sm">
          <a 
            title="Subokep" 
            href="https://subokep.online/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <img 
              src="https://blogger.googleusercontent.com/img/a/AVvXsEg4A-vTu9eqeg2K7fgxMFI5JKyrIhgHZIXhfIOKtgds0jlavOGJYcQNljJTHjy5LVzlqrq96LrY1asb5HWyPLTguYMu05Q6smGF7dLz5m7irhXbEe9oG_SFHIjS0y370JdCFC4P8E_cujz6LO9TbmezylqTDDYi1jBQRGIT-nGaqrkt6LWLRI0Lc_KDaYq6" 
              alt="Promosi Subokep" 
              width={720} // Sesuaikan dengan ukuran asli gambar agar tidak pecah
              height={90}
              className="max-w-full h-auto border-none" 
            />
          </a>
        </div>
      </div>
    </>
  );
}