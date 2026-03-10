import Link from 'next/link';
import MangaCard from './MangaCard';

export default function MangaSection({ title, mangas = [], href, accent = false }) {
  if (!mangas?.length) return null;

  return (
    <section className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className={`font-display text-xl tracking-widest ${accent ? 'text-accent-red' : 'text-text-primary'}`}>
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-xs font-semibold text-text-muted hover:text-accent-red transition-colors flex items-center gap-1">
            Lihat Semua
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {mangas.map((manga) => (
            <div key={manga._id || manga.slug} className="flex-none w-[120px] snap-start">
              <MangaCard manga={manga} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MangaGrid({ mangas = [] }) {
  if (!mangas?.length) return null;

  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {mangas.map((manga) => (
        <MangaCard key={manga._id || manga.slug} manga={manga} />
      ))}
    </div>
  );
}
