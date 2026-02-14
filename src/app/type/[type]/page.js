import Navbar from '@/components/Navbar';
import MangaCard from '@/components/MangaCard';
import Link from 'next/link';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config'; // Import Config

// --- FETCH DATA ---
async function getTypeManga(type, page) {
  try {
    // Menggunakan API Base URL dari Config
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga?type=${type}&page=${page}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (e) {
    console.error("Gagal mengambil data tipe manga:", e);
    return { data: [] };
  }
}

// --- GENERATE METADATA (SEO & OG:URL FIX) ---
export async function generateMetadata({ params, searchParams }) {
  const { type } = await params;
  const sp = await searchParams;
  const page = sp.page || 1;
  
  // Kapitalisasi tipe untuk judul (misal: manhwa -> Manhwa)
  const displayType = type.charAt(0).toUpperCase() + type.slice(1);
  
  let title = `Daftar Komik Tipe ${displayType}`;
  if (page > 1) title += ` - Halaman ${page}`;

  return {
    title: title,
    description: `Filter dan cari komik tipe ${displayType} terlengkap bahasa Indonesia.`,
    openGraph: {
      title: title,
      description: `Filter dan cari komik tipe ${displayType} terlengkap bahasa Indonesia.`,
      // Menggunakan Base URL dari Config untuk konsistensi link
      url: `${SITE_CONFIG.baseUrl}/type/${type}${page > 1 ? `?page=${page}` : ''}`,
      siteName: SITE_CONFIG.name,
      locale: 'id_ID',
      type: 'website',
    },
  };
}

export default async function TypePage({ params, searchParams }) {
  // 1. Ambil parameter dari URL (misal: "manhwa")
  const { type } = await params;
  
  // 2. Ambil parameter halaman (misal: ?page=2)
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  // 3. Fetch Data
  const { data: mangas } = await getTypeManga(type, page);

  // Kapitalisasi Judul (manhwa -> MANHWA)
  const displayTitle = type.toUpperCase();

  return (
    <main className="min-h-screen bg-dark pb-20 font-sans">
      <Navbar />

      <div className="w-full mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        <div className="bg-card p-6 rounded-lg border border-gray-800 mb-8 shadow-lg flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full text-primary">
                <Layers size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                    TIPE: <span className="text-primary">{displayTitle}</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Daftar komik dengan kategori {displayTitle}
                </p>
            </div>
        </div>

        {/* HASIL DATA */}
        {mangas && mangas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mangas.map(manga => (
                    <MangaCard key={manga._id} manga={manga} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-card rounded-lg border border-gray-800">
                <p className="text-gray-400 text-lg">Belum ada komik untuk tipe ini.</p>
                <Link href="/list" className="text-primary text-sm mt-2 inline-block hover:underline">
                    Lihat Semua Komik
                </Link>
            </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
                <Link 
                    href={`/type/${type}?page=${page - 1}`} 
                    className="bg-card border border-gray-700 hover:border-primary text-white px-4 py-2 rounded flex items-center gap-1 transition"
                >
                    <ChevronLeft size={16} /> Prev
                </Link>
            )}
            
            <span className="bg-primary text-white px-4 py-2 rounded font-bold shadow-lg">
                {page}
            </span>

            {mangas && mangas.length >= 20 && (
                <Link 
                    href={`/type/${type}?page=${page + 1}`} 
                    className="bg-card border border-gray-700 hover:border-primary text-white px-4 py-2 rounded flex items-center gap-1 transition"
                >
                    Next <ChevronRight size={16} />
                </Link>
            )}
        </div>

      </div>
    </main>
  );
}