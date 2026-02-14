import Navbar from '@/components/Navbar';
import MangaCard from '@/components/MangaCard';
import Link from 'next/link';
import { Search, Frown } from 'lucide-react'; // Menambahkan ikon untuk UI yang lebih baik
import { SITE_CONFIG } from '@/lib/config'; // Import Config

// --- FETCH DATA ---
async function searchManga(query) {
  if (!query) return { data: [] }; // Jangan fetch kalau query kosong
  
  try {
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga?q=${query}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (e) {
    console.error("Gagal melakukan pencarian:", e);
    return { data: [] };
  }
}

// --- GENERATE METADATA ---
export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const query = sp.q || '';
  
  const title = query ? `Hasil Pencarian: "${query}"` : 'Pencarian Komik';
  
  return {
    title: title,
    description: `Hasil pencarian komik untuk "${query}" di database ${SITE_CONFIG.name}.`,
    openGraph: {
      title: title,
      description: `Cari dan baca komik "${query}" bahasa Indonesia.`,
      url: `${SITE_CONFIG.baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      siteName: SITE_CONFIG.name,
      locale: 'id_ID',
      type: 'website',
    },
  };
}

// --- MAIN COMPONENT ---
export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.q || '';
  
  // Fetch data
  const { data: mangas } = await searchManga(query);
  const hasResults = mangas && mangas.length > 0;

  return (
    <main className="min-h-screen bg-dark pb-20 font-sans">
      <Navbar />

      <div className="w-full mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        <div className="bg-card p-6 rounded-lg border border-gray-800 mb-8 shadow-lg flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full text-primary">
                <Search size={28} />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    PENCARIAN: <span className="text-primary italic">"{query}"</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    {hasResults ? `Ditemukan ${mangas.length} hasil pencarian.` : 'Mencari judul komik di database kami.'}
                </p>
            </div>
        </div>

        {/* HASIL PENCARIAN */}
        {hasResults ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mangas.map(manga => (
                    <MangaCard key={manga._id} manga={manga} />
                ))}
            </div>
        ) : (
            // EMPTY STATE (Jika tidak ada hasil)
            <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-lg border border-gray-800 border-dashed">
                <Frown size={64} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-300">Tidak Ditemukan</h3>
                <p className="text-gray-500 mt-2 text-center max-w-md">
                    Maaf, kami tidak dapat menemukan komik dengan kata kunci 
                    <span className="text-primary font-bold mx-1">"{query}"</span>.
                </p>
                <div className="mt-6 flex gap-4">
                    <Link href="/list" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition text-sm">
                        Lihat Daftar Komik
                    </Link>
                    <Link href="/" className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded transition text-sm">
                        Ke Beranda
                    </Link>
                </div>
            </div>
        )}

      </div>
    </main>
  );
}