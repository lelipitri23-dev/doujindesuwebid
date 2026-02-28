import { getMangaDetail } from '@/lib/api';
import Navbar from '@/components/Navbar';
import MangaCard from '@/components/MangaCard';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookmarkButton from '@/components/BookmarkButton';
import AdBanner from '@/components/AdBanner';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const res = await getMangaDetail(params.slug);
  const manga = res?.data?.info;
  if (!manga) return { title: 'Komik Tidak Ditemukan' };

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://doujindesu.online';
  const coverImage = manga.coverImage || manga.thumb || '';
  const type = manga.type || '';
  const status = manga.status || '';
  const synopsis = manga.synopsis || '';

  return {
    title: manga.title,
    description: `Baca ${manga.title} - ${type || 'Komik'} ${status}. ${synopsis?.slice(0, 120) || ''}`,
    openGraph: {
      title: manga.title,
      description: `Baca ${manga.title} di ${process.env.NEXT_PUBLIC_SITE_NAME} gratis!`,
      images: [{ url: coverImage, alt: manga.title }],
      type: 'book',
    },
    alternates: { canonical: `${SITE_URL}/manga/${params.slug}` },
  };
}

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default async function MangaDetailPage({ params }) {
  const res = await getMangaDetail(params.slug);
  if (!res?.data?.info) notFound();

  const { info: manga, chapters = [], recommendations = [] } = res.data;

  // Ambil field dari normalizeManga (sudah diproses di lib/api.js)
  const coverImage = manga.coverImage || manga.thumb || '';
  const type = manga.type || '';
  const status = manga.status || '';
  const author = manga.author || '';
  const synopsis = manga.synopsis || '';
  const rating = manga.rating || 0;
  const genres = manga.tags || manga.genres || [];

  const firstChapter = chapters[chapters.length - 1];
  const latestChapter = chapters[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: manga.title,
    image: coverImage,
    author: { '@type': 'Organization', name: author || 'Unknown' },
    genre: genres?.join(', '),
    ...(rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        bestRating: 10,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-14 pb-safe max-w-2xl mx-auto">

        {/* ── HERO ─── */}
        <div className="relative overflow-hidden" style={{ minHeight: '220px' }}>
          {coverImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={coverImage}
                alt={`${manga.title} cover`}
                fill
                className="object-cover scale-110 opacity-20"
                style={{ filter: 'blur(-0px)' }}
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/30 via-bg-primary/60 to-bg-primary" />
            </div>
          )}

          <div className="relative z-10 px-4 pt-5 pb-5 flex gap-4">
            {/* Cover */}
            <div className="flex-none w-24 rounded-xl overflow-hidden border-2 border-accent-red shadow-xl shadow-blue-500/20 self-start">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={manga.title}
                  width={96}
                  height={136}
                  className="object-cover w-full"
                  style={{ aspectRatio: '2/3' }}
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full bg-bg-elevated" style={{ aspectRatio: '2/3' }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="font-display text-xl text-text-primary leading-tight tracking-wide mb-2">
                {manga.title}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {type && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${type?.toLowerCase() === 'manhwa' ? 'bg-purple-900/50 border-purple-700 text-purple-300'
                    : type?.toLowerCase() === 'manhua' ? 'bg-orange-900/50 border-orange-700 text-orange-300'
                      : type?.toLowerCase() === 'doujinshi' ? 'bg-pink-900/50 border-pink-700 text-pink-300'
                        : 'bg-blue-900/50 border-blue-700 text-blue-300'
                    }`}>
                    {type}
                  </span>
                )}
                {status && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${status?.toLowerCase() === 'ongoing'
                    ? 'bg-green-900/50 border-green-700 text-green-300'
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                    }`}>
                    {status}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-wrap mb-2">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="#ffd700" className="w-4 h-4">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-bold text-accent-gold text-sm">{rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-text-muted text-xs">{formatNum(manga.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                  <span className="text-text-muted text-xs">{chapters.length} Ch</span>
                </div>
              </div>

              {author && (
                <p className="text-text-muted text-xs mt-1">
                  Pengarang: <span className="text-text-secondary font-semibold">{author}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        {/* ── END HERO ── */}

        {/* Tombol Baca */}
        {chapters.length > 0 && (
          <div className="px-4 mt-3 flex gap-3">
            {firstChapter && (
              <Link
                href={`/read/${manga.slug}/${firstChapter.slug}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-elevated border border-border rounded-xl text-text-secondary font-bold text-sm hover:border-accent-red transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Mulai Baca
              </Link>
            )}
            {latestChapter && (
              <Link
                href={`/read/${manga.slug}/${latestChapter.slug}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-red rounded-xl text-white font-bold text-sm hover:bg-accent-redDark transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                  <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                </svg>
                Chapter Terbaru
              </Link>
            )}
          </div>
        )}

        {/* Bookmark */}
        <div className="px-4 mt-3">
          <BookmarkButton manga={manga} />
        </div>

        {/* Genres */}
        {genres?.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link
                  key={g}
                  href={`/manga?genre=${encodeURIComponent(g)}`}
                  className="text-[10px] font-bold px-3 py-1 bg-bg-elevated text-text-secondary rounded-lg border border-border hover:text-accent-red hover:border-accent-red transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Synopsis */}
        {synopsis && (
          <div className="px-4 mt-4">
            <h2 className="font-display text-base tracking-widest text-text-secondary mb-2">SINOPSIS</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{synopsis}</p>
          </div>
        )}

        <AdBanner slot="BEFORE_CHAPTERS" className="px-4 mt-4" />

        {/* Chapter List */}
        {chapters.length > 0 && (
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base tracking-widest text-text-primary">DAFTAR CHAPTER</h2>
              <span className="text-text-muted text-xs">{chapters.length} chapter</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/read/${manga.slug}/${ch.slug}`}
                  className="chapter-item group flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent-red transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent-red transition-colors truncate">
                      {ch.title}
                    </p>
                    {ch.createdAt && (
                      <p className="text-[10px] text-text-muted mt-0.5">{formatDate(ch.createdAt)}</p>
                    )}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted group-hover:text-accent-red flex-shrink-0 ml-2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── REKOMENDASI ── */}
        {recommendations.length > 0 && (
          <div className="px-4 mt-8 mb-6 border-t border-border pt-6">
            <h2 className="font-display text-base tracking-widest text-text-primary mb-4">REKOMENDASI LAINNYA</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {recommendations.map((rec) => (
                <MangaCard key={rec.slug} manga={rec} size="sm" />
              ))}
            </div>
          </div>
        )}

        <div className="h-6" />
      </main>
    </div>
  );
}
