'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MangaCard from '@/components/MangaCard';
import { Bookmark, Trash2, Library } from 'lucide-react'; // Tambah icon Library
import Link from 'next/link';

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil data dari LocalStorage saat component mount
    const saved = JSON.parse(localStorage.getItem('komik_bookmarks') || '[]');
    setBookmarks(saved);
    setIsLoading(false);
  }, []);

  const clearAll = () => {
    if (confirm('Hapus semua bookmark?')) {
        localStorage.removeItem('komik_bookmarks');
        setBookmarks([]);
    }
  };

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
                        {isLoading ? 'Memuat...' : `${bookmarks.length} Komik Tersimpan`}
                    </p>
                </div>
            </div>

            {bookmarks.length > 0 && (
                <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-900/50 transition"
                >
                    <Trash2 size={14} /> Hapus Semua
                </button>
            )}
        </div>

        {/* Content */}
        {isLoading ? (
             <div className="text-center py-20 text-gray-500 animate-pulse">Sedang memuat perpustakaan...</div>
        ) : bookmarks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {bookmarks.map((manga, idx) => (
                    <MangaCard key={manga._id || idx} manga={manga} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-gray-800 border-dashed">
                <Bookmark size={64} className="text-gray-700 mb-6 opacity-50" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">Belum ada Bookmark</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-md leading-relaxed">
                    Anda belum menyimpan komik apapun. Simpan manga, manhwa, atau doujinshi favoritmu agar mudah diakses kembali tanpa perlu mencari ulang.
                </p>
                <Link href="/list" className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-blue-900/20">
                    Mulai Cari Komik
                </Link>
            </div>
        )}

      </div>
    </main>
  );
}