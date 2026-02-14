'use client';

import { useState } from 'react';
import { ChevronDown, Search, Check, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen Accordion Reusable
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-800 py-4 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between text-white font-bold text-sm uppercase tracking-wide hover:text-primary transition group"
      >
        <span className="group-hover:pl-1 transition-all duration-200">{title}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export default function ExploreSidebar({ genres = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [genreSearch, setGenreSearch] = useState('');

  // Helper Update URL
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Toggle Logic
    if (value === params.get(key)) {
        params.delete(key);
    } else {
        params.set(key, value);
    }
    
    params.delete('page'); // Reset page ke 1
    router.push(`/list?${params.toString()}`);
  };

  const currentGenre = searchParams.get('genre');
  const currentStatus = searchParams.get('status');
  const currentType = searchParams.get('type');

  // Filter list genre based on search input
  const filteredGenres = genres.filter(g => 
    (typeof g === 'string' ? g : g.name).toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
      
      {/* HEADER MOBILE */}
      <div className="lg:hidden flex items-center gap-2 mb-4 text-white font-bold">
        <Filter size={20} className="text-primary" /> Filter Pencarian
      </div>

      {/* 1. GENRE SECTION */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex justify-between items-center">
            Genre
            {currentGenre && (
                <button onClick={() => updateFilter('genre', currentGenre)} className="text-[10px] text-red-400 hover:text-red-300">Reset</button>
            )}
        </h3>
        
        {/* Genre Search Input */}
        <div className="relative mb-4 group">
            <input 
                type="text" 
                placeholder="Search Genre..." 
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="w-full bg-[#111] border border-gray-700 rounded-lg py-2.5 pl-3 pr-8 text-xs text-gray-300 focus:border-primary focus:outline-none transition focus:bg-black"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition" />
        </div>

        {/* Genre Pills Grid */}
        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar content-start pr-1">
            {filteredGenres.map((gObj) => {
                const gName = typeof gObj === 'string' ? gObj : gObj.name;
                const isActive = currentGenre === gName;
                return (
                    <button
                        key={gName}
                        onClick={() => updateFilter('genre', gName)}
                        className={`px-3 py-1.5 rounded text-[11px] font-medium border transition ${
                            isActive 
                            ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                            : 'bg-[#111] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                    >
                        {gName}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 2. OTHER FILTERS (Accordion Style) */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 shadow-lg">
        
        {/* Format / Type (Removed Manhua) */}
        <FilterSection title="Format" defaultOpen={true}>
             <div className="space-y-1">
                {['Manga', 'Manhwa', 'Doujinshi'].map(type => (
                    <button 
                        key={type}
                        onClick={() => updateFilter('type', type)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition ${
                            currentType === type 
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                            : 'text-gray-400 hover:bg-[#111] hover:text-white border border-transparent'
                        }`}
                    >
                        {type}
                        {currentType === type && <Check size={14} className="text-primary" />}
                    </button>
                ))}
             </div>
        </FilterSection>

        {/* Status (Changed to Publishing & Finished) */}
        <FilterSection title="Status" defaultOpen={true}>
             <div className="space-y-1">
                {['Publishing', 'Finished'].map(status => (
                    <button 
                        key={status}
                        onClick={() => updateFilter('status', status)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition ${
                            currentStatus === status 
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                            : 'text-gray-400 hover:bg-[#111] hover:text-white border border-transparent'
                        }`}
                    >
                        {status}
                        {currentStatus === status && <Check size={14} className="text-primary" />}
                    </button>
                ))}
             </div>
        </FilterSection>

      </div>
    </aside>
  );
}