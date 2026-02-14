'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MangaCard from '@/components/MangaCard';
import AuthModal from '@/components/AuthModal'; // Import Modal
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Bookmark, Trash2, Library, Lock } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // State User
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 1. Cek User Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Jika user login, baru ambil data dari localstorage
      if (currentUser) {
        const saved = JSON.parse(localStorage.getItem('komik_bookmarks') || '[]');
        setBookmarks(saved);
      } else {
        setBookmarks([]); // Kosongkan jika logout
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAll = () => {
    if (confirm('Hapus semua bookmark?')) {
        localStorage.removeItem('komik_bookmarks');
        setBookmarks([]);
    }
  };

  // Render Loading State
  if (isLoading) {
    return (
      <main className="min-h-screen bg-dark pb-20 font-sans">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="bg-card p-6 rounded-lg border border-gray-800 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-full">
                    <Library className="text-primary" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white uppercase">Library Komik Saya</h1>
                    <p className="text-xs text-gray-400">
                        {user ? `${bookmarks.length} Komik Tersimpan` : 'Login Diperlukan'}
                    </p>
                </div>
            </div>

            {user && bookmarks.length > 0 && (
                <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-900/50 transition"
                >
                    <Trash2 size={14} /> Hapus Semua
                </button>
            )}
        </div>

        {/* --- LOGIKA TAMPILAN KONTEN --- */}
        {!user ? (
            // TAMPILAN JIKA BELUM LOGIN
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-gray-800 border-dashed">
                <div className="bg-darker p-4 rounded-full mb-6">
                    <Lock size={48} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Akses Terbatas</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-md leading-relaxed px-4">
                    Anda harus login terlebih dahulu untuk melihat dan menyimpan koleksi komik favorit Anda.
                </p>
                <button 
                    onClick={() => setShowLoginModal(true)}
                    className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-blue-900/20"
                >
                    Login / Daftar Sekarang
                </button>
            </div>
        ) : bookmarks.length > 0 ? (
            // TAMPILAN JIKA SUDAH LOGIN & ADA DATA
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {bookmarks.map((manga, idx) => (
                    <MangaCard key={manga._id || idx} manga={manga} />
                ))}
            </div>
        ) : (
            // TAMPILAN JIKA SUDAH LOGIN TAPI KOSONG
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-gray-800 border-dashed">
                <Bookmark size={64} className="text-gray-700 mb-6 opacity-50" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">Belum ada Bookmark</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-md leading-relaxed">
                    Halo <strong>{user.email?.split('@')[0]}</strong>, Anda belum menyimpan komik apapun.
                </p>
                <Link href="/list" className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-blue-900/20">
                    Mulai Cari Komik
                </Link>
            </div>
        )}

      </div>

      {/* Pasang Modal Login disini juga */}
      <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}