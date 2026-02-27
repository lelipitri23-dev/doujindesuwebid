'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid, List, X } from 'lucide-react';
import MangaCard from './MangaCard';
import MangaListItem from './MangaListItem';

const TYPES = ['', 'manga', 'manhwa', 'doujinshi'];
const STATUSES = ['', 'Publishing', 'Finished'];

export default function BrowseControl({ genres, totalItems, q, mangas, currentFilters = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [localFilter, setLocalFilter] = useState({
    type: currentFilters.type || searchParams.get('type') || '',
    status: currentFilters.status || searchParams.get('status') || '',
    genre: currentFilters.genre || searchParams.get('genre') || '',
  });

  useEffect(() => {
    setLocalFilter({
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
      genre: searchParams.get('genre') || '',
    });
  }, [searchParams]);

  const handleSelect = (key, value) => {
    setLocalFilter(prev => ({ ...prev, [key]: value }));
  };

  const applyFilter = () => {
    const p = new URLSearchParams();
    const qVal = searchParams.get('q');
    if (qVal) p.set('q', qVal);
    if (localFilter.type) p.set('type', localFilter.type);
    if (localFilter.status) p.set('status', localFilter.status);
    if (localFilter.genre) p.set('genre', localFilter.genre);
    router.push(`/manga?${p.toString()}`);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setLocalFilter({ type: '', status: '', genre: '' });
  };

  const activeFilterCount = [localFilter.type, localFilter.status, localFilter.genre].filter(Boolean).length;

  const OptionButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isActive
          ? 'bg-accent-red border-accent-red text-white'
          : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
        }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-white tracking-wide mb-1">
            {q ? (
              <span>Hasil: <span className="text-accent-red">"{q}"</span></span>
            ) : localFilter.genre ? (
              <span>Genre: <span className="text-accent-red">{localFilter.genre}</span></span>
            ) : localFilter.type ? (
              <span className="capitalize">{localFilter.type}</span>
            ) : (
              'Daftar Komik'
            )}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            {totalItems > 0 ? `${totalItems} judul ditemukan` : 'Tidak ada judul ditemukan'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={20} />
            </button>
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:border-accent-red hover:text-accent-red transition-all"
          >
            <Filter size={18} />
            <span className="text-sm font-bold">Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {mangas.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga._id || manga.slug} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mangas.map((manga) => (
              <MangaListItem key={manga._id || manga.slug} manga={manga} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-gray-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="font-display text-lg text-white tracking-wide mb-1">Tidak ada komik ditemukan</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">Coba kurangi filter atau gunakan kata kunci lain.</p>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-full max-w-lg bg-bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-white">Filter Komik</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tipe */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Tipe</h3>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <OptionButton
                      key={t || 'all'}
                      label={t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Semua'}
                      isActive={localFilter.type === t}
                      onClick={() => handleSelect('type', t)}
                    />
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <OptionButton
                      key={s || 'all'}
                      label={s ? (s === 'Publishing' ? 'ONG' : 'END') : 'Semua'}
                      isActive={localFilter.status === s}
                      onClick={() => handleSelect('status', s)}
                    />
                  ))}
                </div>
              </div>

              {/* Genre */}
              {genres?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Genre</h3>
                  <div className="flex flex-wrap gap-2">
                    <OptionButton
                      label="Semua"
                      isActive={localFilter.genre === ''}
                      onClick={() => handleSelect('genre', '')}
                    />
                    {genres.map((g) => (
                      <OptionButton
                        key={g.name}
                        label={`${g.name} (${g.count})`}
                        isActive={localFilter.genre === g.name}
                        onClick={() => handleSelect('genre', g.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-bg-card rounded-b-2xl flex gap-3">
              <button
                onClick={clearFilter}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold text-sm hover:bg-bg-elevated"
              >
                Reset
              </button>
              <button
                onClick={applyFilter}
                className="flex-1 py-3 rounded-xl bg-accent-red text-white font-bold text-sm hover:bg-accent-redDark shadow-lg"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
