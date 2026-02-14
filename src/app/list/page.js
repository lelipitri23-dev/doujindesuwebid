import Navbar from '@/components/Navbar';
import ExploreClient from '@/components/ExploreClient';
import { SITE_CONFIG } from '@/lib/config';

// --- FETCH DATA ---
async function getMangaList(page, status, type, genre, q, order) { // Tambah parameter order
  try {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (genre) params.set('genre', genre);
    if (q) params.set('q', q);
    if (order) params.set('order', order); // Kirim ke API

    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], pagination: { currentPage: 1, totalPages: 1 } };
    return res.json();
  } catch (e) {
    return { data: [], pagination: {} };
  }
}

// ... (getGenres tetap sama) ...
async function getGenres() {
    try {
      const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/genres`, { cache: 'no-store' });
      if (!res.ok) return { data: [] };
      const json = await res.json();
      return json.data || []; 
    } catch (e) { 
      return []; 
    }
}

export const metadata = {
  title: `Explore Manga - ${SITE_CONFIG.name}`,
  description: 'Cari manga, manhwa, dan manhua terbaru dengan filter lengkap.',
};

export default async function MangaListPage({ searchParams }) {
  const params = await searchParams;
  const page = params.page || 1;
  // Ambil parameter order, default null
  const { status, type, genre, q, order } = params; 

  // Fetch Paralel
  const [mangaRes, genreList] = await Promise.all([
    getMangaList(page, status, type, genre, q, order), // Pass order disini
    getGenres()
  ]);

  return (
    <main className="min-h-screen bg-[#111] pb-20 font-sans">
      <Navbar />
      
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-6 mb-8 shadow-md">
         <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white mb-1">Cari Komik</h1>
            <p className="text-sm text-gray-400">
                {q ? `Hasil pencarian untuk "${q}"` : 'Temukan manga favoritmu dengan filter canggih.'}
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4">
        <ExploreClient 
            initialMangas={mangaRes.data || []} 
            pagination={mangaRes.pagination || {}} 
            genres={genreList || []} 
        />
      </div>
    </main>
  );
}