import BookmarksClient from './BookmarksClient';
import { SITE_CONFIG } from '@/lib/config';

// --- SEO CONFIGURATION ---
export const metadata = {
  title: `Library Saya - Bookmark Komik Favorit | ${SITE_CONFIG.name}`,
  description: `Akses cepat daftar bacaan manga, manhwa, dan komik favorit yang telah Anda simpan di ${SITE_CONFIG.name}. Lanjutkan membaca chapter terakhir dengan mudah.`,
  robots: {
    // PENTING: Kita set 'noindex' karena halaman bookmark isinya berbeda tiap user (lokal).
    // Google Bot akan melihat halaman ini kosong (karena bot tidak punya localStorage),
    // jadi lebih baik tidak diindeks agar tidak dianggap "Thin Content" (konten sampah).
    index: false, 
    follow: true,
  },
  openGraph: {
    title: `Library Komik Saya - ${SITE_CONFIG.name}`,
    description: 'Daftar koleksi komik pribadi yang tersimpan.',
    url: `${SITE_CONFIG.baseUrl}/bookmarks`,
    type: 'website',
  }
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}