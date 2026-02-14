'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { auth } from '@/lib/firebase'; // Import Firebase Auth
import { onAuthStateChanged } from 'firebase/auth'; // Listener status user
import AuthModal from './AuthModal'; // Import Modal Login

export default function BookmarkButton({ manga }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState(null); // State untuk menyimpan data user login
  const [showLoginModal, setShowLoginModal] = useState(false); // State untuk kontrol modal

  // Gunakan slug sebagai ID unik
  const mangaSlug = manga?.slug;

  // 1. Cek apakah User sedang Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cek status bookmark di LocalStorage
  // (Hanya dijalankan saat komponen mount atau slug berubah)
  useEffect(() => {
    if (typeof window !== 'undefined' && mangaSlug) {
        const bookmarks = JSON.parse(localStorage.getItem('komik_bookmarks') || '[]');
        const exists = bookmarks.some(b => b.slug === mangaSlug);
        setIsBookmarked(exists);
    }
  }, [mangaSlug]);

  // 3. Fungsi Utama saat tombol diklik
  const handleBookmarkClick = () => {
    // LOGIKA PENTING: Cek Login Dulu!
    if (!user) {
        setShowLoginModal(true); // Buka modal jika belum login
        return; // Stop, jangan lanjut simpan data
    }

    // Jika user ada, jalankan logika penyimpanan yang lama
    const bookmarks = JSON.parse(localStorage.getItem('komik_bookmarks') || '[]');
    
    if (isBookmarked) {
        // Hapus dari bookmark
        const newBookmarks = bookmarks.filter(b => b.slug !== mangaSlug);
        localStorage.setItem('komik_bookmarks', JSON.stringify(newBookmarks));
        setIsBookmarked(false);
        
        // Dispatch event agar component lain (seperti Navbar) tau ada perubahan
        window.dispatchEvent(new Event('storage')); 
    } else {
        // Tambah ke bookmark
        const dataToSave = {
            _id: manga._id || Date.now().toString(),
            title: manga.title,
            slug: manga.slug,
            thumb: manga.thumb,
            chapter_count: manga.chapter_count || 0,
            metadata: {
                type: manga.metadata?.type || manga.type || 'Manga',
                rating: manga.metadata?.rating || manga.rating || '?',
                status: manga.metadata?.status || manga.status || 'Unknown',
            }
        };

        const newBookmarks = [dataToSave, ...bookmarks];
        localStorage.setItem('komik_bookmarks', JSON.stringify(newBookmarks));
        setIsBookmarked(true);

        // Dispatch event update
        window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <>
        <button 
            onClick={handleBookmarkClick}
            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-md border ${
                isBookmarked 
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500' 
                : 'bg-primary hover:bg-blue-600 text-white border-blue-400'
            }`}
        >
            <Bookmark size={16} className={isBookmarked ? "fill-white" : ""} />
            {isBookmarked ? 'TERSIMPAN' : 'BOOKMARK'}
        </button>

        {/* Modal Login akan muncul di sini jika showLoginModal = true */}
        <AuthModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
        />
    </>
  );
}