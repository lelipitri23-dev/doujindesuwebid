'use client';

import { useState } from 'react';
import { LayoutGrid, List as ListIcon, Search, ChevronDown, ArrowDownUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import MangaCard from '@/components/MangaCard';
import MangaListItem from '@/components/MangaListItem';
import ExploreSidebar from '@/components/ExploreSidebar';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ExploreClient({ initialMangas, pagination, genres }) {
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false); // State untuk Dropdown Sort

  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil parameter order dari URL, default 'latest'
  const currentOrder = searchParams.get('order') || 'latest';

  // Mapping Label untuk tampilan UI
  const sortOptions = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'popular', label: 'Populer' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' },
  ];

  // Label yang sedang aktif
  const activeLabel = sortOptions.find(o => o.value === currentOrder)?.label || 'Terbaru';

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    params.delete('page');
    router.push(`/list?${params.toString()}`);
  };

  // Fungsi Handle Sort
  const handleSort = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('order', value);
    params.delete('page'); // Reset ke halaman 1 jika ganti sort
    router.push(`/list?${params.toString()}`);
    setIsSortOpen(false); // Tutup dropdown
  };

  // Fungsi Toggle Order (Shortuct Icon ArrowUpDown)
  const toggleOrderDirection = () => {
    // Logic sederhana: Jika latest -> ubah ke oldest, dan sebaliknya
    if (currentOrder === 'latest') handleSort('oldest');
    else if (currentOrder === 'oldest') handleSort('latest');
    else handleSort('latest');
  };

  const page = Number(searchParams.get('page')) || 1;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR */}
        <ExploreSidebar genres={genres} />

        {/* KONTEN UTAMA */}
        <div className="flex-1 w-full min-w-0">
            
            {/* --- TOP BAR --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 z-20 relative">
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari komik..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg h-12 pl-12 pr-4 text-white focus:border-primary focus:outline-none placeholder:text-gray-600 shadow-sm transition"
                    />
                </form>

                {/* Tools */}
                <div className="flex items-center gap-3">
                    
                    {/* View Toggle */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-1 flex h-12 items-center">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>

                    {/* SORT DROPDOWN (Interactive) */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="hidden sm:flex bg-[#1a1a1a] border border-gray-800 rounded-lg h-12 px-4 items-center justify-between min-w-[140px] text-sm text-gray-300 hover:border-gray-600 transition"
                        >
                            <span>{activeLabel}</span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isSortOpen && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSort(option.value)}
                                        className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center hover:bg-white/5 transition ${
                                            currentOrder === option.value ? 'text-primary font-bold bg-primary/10' : 'text-gray-400'
                                        }`}
                                    >
                                        {option.label}
                                        {currentOrder === option.value && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Toggle Shortcut */}
                    <button 
                        onClick={toggleOrderDirection}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg h-12 w-12 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition active:scale-95"
                        title="Balik Urutan"
                    >
                        <ArrowDownUp size={18} />
                    </button>
                </div>
            </div>

            {/* --- RESULTS GRID / LIST --- */}
            {initialMangas.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {initialMangas.map(manga => (
                            <MangaCard key={manga._id} manga={manga} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {initialMangas.map(manga => (
                            <MangaListItem key={manga._id} manga={manga} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-gray-800">
                    <p className="text-gray-500">Komik tidak ditemukan.</p>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center gap-2">
                <button 
                    disabled={page <= 1}
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', page - 1);
                        router.push(`/list?${params.toString()}`);
                    }}
                    className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition flex items-center gap-1"
                >
                    <ChevronLeft size={16} /> Prev
                </button>
                
                <span className="px-4 py-2 bg-primary rounded-lg text-sm text-white font-bold flex items-center shadow-lg shadow-primary/20">
                    {page}
                </span>
                
                <button 
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', page + 1);
                        router.push(`/list?${params.toString()}`);
                    }}
                    className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition flex items-center gap-1"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>

        </div>
    </div>
  );
}