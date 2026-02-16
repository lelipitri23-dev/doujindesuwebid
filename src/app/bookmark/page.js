import { Suspense } from 'react'; //
import BookmarksClient from './BookmarksClient';
import { SITE_CONFIG } from '@/lib/config';

// --- SEO CONFIGURATION ---
export const metadata = {
  title: `Library Saya`,
  description: `Akses cepat daftar bacaan manga, manhwa, dan komik favorit yang telah Anda simpan di ${SITE_CONFIG.name}. Lanjutkan membaca chapter terakhir dengan mudah.`,
  robots: {
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
  return (
    // Membungkus BookmarksClient dengan Suspense untuk menangani useSearchParams
    <Suspense fallback={
      <main className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </main>
    }>
      <BookmarksClient />
    </Suspense>
  );
}