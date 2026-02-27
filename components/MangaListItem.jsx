import Link from 'next/link';
import Image from 'next/image';

export default function MangaListItem({ manga }) {
  if (!manga) return null;

  const coverImage = manga.coverImage || manga.thumb || '';
  const type = manga.type || manga.metadata?.type || '';
  const status = manga.status || manga.metadata?.status || '';

  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border hover:border-accent-red transition-all duration-200"
    >
      {/* Cover */}
      <div className="relative flex-none w-14 h-20 rounded-lg overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={manga.title}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-bg-elevated" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-text-primary group-hover:text-accent-red transition-colors line-clamp-2 leading-tight mb-1">
          {manga.title}
        </p>
        <div className="flex flex-wrap gap-1 mb-1">
          {type && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 uppercase">
              {type}
            </span>
          )}
          {status && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
              status?.toLowerCase() === 'publishing' || status?.toLowerCase() === 'ongoing'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-gray-800 text-gray-500'
            }`}>
              {status?.toLowerCase() === 'publishing' || status?.toLowerCase() === 'ongoing' ? 'ONG' : 'END'}
            </span>
          )}
        </div>
        <p className="text-text-muted text-[10px]">
          {manga.chapter_count > 0 ? `${manga.chapter_count} chapter` : ''}
        </p>
      </div>

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted group-hover:text-accent-red flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
