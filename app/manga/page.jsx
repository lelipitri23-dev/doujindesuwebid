import { getMangaList, getGenres } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BrowseControl from '@/components/BrowseControl';
import AdBanner from '@/components/AdBanner';

export const revalidate = 120;

export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q;
  const type = searchParams?.type;
  const genre = searchParams?.genre;
  const status = searchParams?.status;
  const order = searchParams?.order;
  let title = 'Daftar Komik';
  if (q) title = `Cari: ${q}`;
  else if (genre) title = `Genre: ${genre}`;
  else if (type) title = `${type.charAt(0).toUpperCase() + type.slice(1)} Terbaru`;
  else if (status) title = `Status: ${status}`;
  else if (order === 'popular') title = 'Komik Populer';
  else if (order === 'oldest') title = 'Komik Terlama';
  else if (order === 'az') title = 'Komik A-Z';
  else if (order === 'za') title = 'Komik Z-A';
  return {
    title,
    description: `${title} - Temukan ribuan judul manga di ${process.env.NEXT_PUBLIC_SITE_NAME}.`,
  };
}

export default async function BrowsePage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  
  // Params untuk getMangaList — hanya kirim yang ada nilainya
  const params = {
    page,
    limit: 24,
    q:      searchParams?.q      || '',
    genre:  searchParams?.genre  || '',
    type:   searchParams?.type   || '',
    status: searchParams?.status || '',
    order:  searchParams?.order  || '',
  };

  // Build href helper untuk pagination
  const buildHref = (newPage) => {
    const p = new URLSearchParams();
    if (params.q)      p.set('q',      params.q);
    if (params.genre)  p.set('genre',  params.genre);
    if (params.type)   p.set('type',   params.type);
    if (params.status) p.set('status', params.status);
    if (params.order)  p.set('order',  params.order);
    if (newPage > 1)   p.set('page',   String(newPage));
    const qs = p.toString();
    return `/manga${qs ? '?' + qs : ''}`;
  };

  // Fetch data paralel
  const [mangaRes, genreRes] = await Promise.all([
    getMangaList(params),
    getGenres(),
  ]);

  const mangas = mangaRes?.data || [];
  const pagination = mangaRes?.pagination || {};
  const genres = genreRes?.data || [];

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Navbar />

      <main className="pt-24 max-w-5xl mx-auto px-4">
        <AdBanner slot="BROWSE_BANNER" className="mb-4" />

        <BrowseControl
          genres={genres}
          totalItems={pagination.totalItems || mangas.length}
          q={params.q}
          mangas={mangas}
          currentFilters={{
            type: params.type,
            status: params.status,
            genre: params.genre,
            order: params.order,
          }}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-10 mt-4">
            <Link
              href={page > 1 ? buildHref(page - 1) : '#'}
              aria-disabled={page <= 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                page > 1
                  ? 'bg-bg-elevated border-border text-text-primary hover:border-accent-red hover:text-accent-red hover:-translate-x-1'
                  : 'bg-transparent border-transparent text-text-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Prev
            </Link>

            <div className="flex flex-col items-center">
              <span className="text-text-primary font-bold text-sm">Halaman {page}</span>
              <span className="text-text-muted text-[10px]">dari {pagination.totalPages}</span>
            </div>

            <Link
              href={page < pagination.totalPages ? buildHref(page + 1) : '#'}
              aria-disabled={page >= pagination.totalPages}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                page < pagination.totalPages
                  ? 'bg-bg-elevated border-border text-text-primary hover:border-accent-red hover:text-accent-red hover:translate-x-1'
                  : 'bg-transparent border-transparent text-text-muted opacity-50 cursor-not-allowed'
              }`}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
