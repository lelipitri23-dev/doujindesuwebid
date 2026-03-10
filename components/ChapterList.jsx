'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const CHAPTERS_PER_PAGE = 50;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ChapterList({ chapters, mangaSlug }) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(CHAPTERS_PER_PAGE);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = chapters;

    // Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((ch) =>
        ch.title?.toString().toLowerCase().includes(q) ||
        ch.slug?.toLowerCase().includes(q)
      );
    }

    // Reverse if ascending
    if (sortAsc) {
      list = [...list].reverse();
    }

    return list;
  }, [chapters, search, sortAsc]);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="px-4 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base tracking-widest text-text-primary">DAFTAR CHAPTER</h2>
        <span className="text-text-muted text-xs">{chapters.length} chapter</span>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(CHAPTERS_PER_PAGE); // reset pagination on search
            }}
            placeholder="Cari chapter..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-bg-elevated border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-red transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setVisibleCount(CHAPTERS_PER_PAGE); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setSortAsc((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-2 text-[10px] font-bold bg-bg-elevated border border-border rounded-xl text-text-secondary hover:border-accent-red hover:text-accent-red transition-colors whitespace-nowrap"
          title={sortAsc ? 'Chapter Terlama' : 'Chapter Terbaru'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 transition-transform ${sortAsc ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {sortAsc ? 'Terlama' : 'Terbaru'}
        </button>
      </div>

      {/* Search results count (only when searching) */}
      {search.trim() && (
        <p className="text-[10px] text-text-muted mb-2">
          {filtered.length} chapter ditemukan
        </p>
      )}

      {/* Chapter Items */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {displayed.length > 0 ? (
          displayed.map((ch) => (
            <Link
              key={ch.slug}
              href={`/read/${mangaSlug}/${ch.slug}`}
              className="chapter-item group flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent-red transition-all"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-red transition-colors truncate">
                  Chapter {ch.title}
                </p>
                {ch.createdAt && (
                  <p className="text-[10px] text-text-muted mt-0.5">{formatDate(ch.createdAt)}</p>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted group-hover:text-accent-red flex-shrink-0 ml-2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))
        ) : (
          <div className="py-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-text-muted mx-auto mb-2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className="text-xs text-text-muted">Tidak ada chapter yang cocok</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((prev) => prev + CHAPTERS_PER_PAGE)}
            className="w-full py-3 mt-2 text-xs font-bold text-text-secondary bg-bg-elevated border border-border rounded-xl hover:border-accent-red hover:text-accent-red transition-colors"
          >
            Muat {Math.min(CHAPTERS_PER_PAGE, filtered.length - visibleCount)} Chapter Lagi
            <span className="text-text-muted font-normal ml-1">
              ({visibleCount}/{filtered.length})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
