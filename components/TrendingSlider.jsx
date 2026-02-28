'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrendingSlider({ trending = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (trending.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [trending.length]);

  if (!trending?.length) return null;

  const items = trending.slice(0, 5);
  const item = items[current];

  // Normalisasi field
  const coverImage = item?.coverImage || item?.thumb || '';
  const type = item?.type || item?.metadata?.type || '';
  const status = item?.status || item?.metadata?.status || '';
  const rating = parseFloat(item?.metadata?.rating) || item?.rating || 0;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '240px' }}>
      {/* Background blur */}
      <div className="absolute inset-0">
        {coverImage && (
          <Image
            src={coverImage}
            alt={item?.title || ''}
            fill
            className="object-cover scale-110 opacity-30"
            style={{ filter: 'blur(-0px)' }}
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-bg-primary/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end p-4">
        <div className="flex gap-4 items-end w-full">
          {/* Cover */}
          <Link href={`/manga/${item?.slug}`} className="flex-none">
            <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-accent-red shadow-lg shadow-blue-500/30">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={item?.title || ''}
                  width={80}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-bg-elevated" />
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0 mb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-accent-red uppercase tracking-widest font-display flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                  <path d="M12 2C9 7 6 9.5 6 13a6 6 0 0012 0c0-3.5-3-6-6-11zm0 18a4 4 0 01-4-4c0-2.5 2-4.5 4-8 2 3.5 4 5.5 4 8a4 4 0 01-4 4z" />
                </svg>
                Trending #{current + 1}
              </span>
            </div>
            <Link href={`/manga/${item?.slug}`}>
              <h2 className="font-display text-xl text-text-primary line-clamp-2 leading-tight tracking-wider mb-1">
                {item?.title}
              </h2>
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              {type && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-text-secondary uppercase">
                  {type}
                </span>
              )}
              {status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${status?.toLowerCase() === 'publishing' || status?.toLowerCase() === 'ongoing'
                    ? 'bg-green-900/60 text-green-400 border border-green-800'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                  {status?.toLowerCase() === 'publishing' || status?.toLowerCase() === 'ongoing' ? 'ONG' : 'END'}
                </span>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="#ffd700" className="w-3.5 h-3.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-xs font-bold text-accent-gold">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 right-4 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-accent-red w-4 h-1.5' : 'bg-border w-1.5 h-1.5'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
