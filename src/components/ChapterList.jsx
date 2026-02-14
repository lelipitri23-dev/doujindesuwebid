'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Clock, Search, List, History } from 'lucide-react';

export default function ChapterList({ chapters = [], slug }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState(chapters);
  const [lastRead, setLastRead] = useState(null); // Menyimpan slug chapter terakhir

  // 1. Load History dari LocalStorage saat pertama kali dibuka
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('reading_history') || '{}');
      // Ambil chapter terakhir untuk manga ini (berdasarkan slug manga)
      if (history[slug]) {
        setLastRead(history[slug]);
      }
    }
    setFilteredChapters(chapters);
  }, [slug, chapters]);

  // 2. Handle Pencarian (Realtime)
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = chapters.filter((chapter) => {
      // Cari berdasarkan Index (angka) atau Judul
      const titleMatch = chapter.title?.toLowerCase().includes(query);
      const indexMatch = chapter.chapter_index?.toString().includes(query); // Asumsi chapter_index ada
      // Fallback jika chapter_index tidak ada, cari di title
      const numberInTitle = chapter.title?.toLowerCase().includes(`chapter ${query}`);
      
      return titleMatch || indexMatch || numberInTitle;
    });

    setFilteredChapters(filtered);
  };

  // 3. Simpan History saat chapter diklik
  const handleChapterClick = (chapterSlug) => {
    const history = JSON.parse(localStorage.getItem('reading_history') || '{}');
    history[slug] = chapterSlug; // Simpan: manga_slug -> chapter_slug
    localStorage.setItem('reading_history', JSON.stringify(history));
    setLastRead(chapterSlug);
  };

  if (!chapters || chapters.length === 0) {
    return <div className="p-4 text-center text-gray-500">Belum ada chapter.</div>;
  }

  return (
    <div className="space-y-4">
      
      {/* === SEARCH BAR (Dipindah ke sini agar berfungsi) === */}
      <div className="relative">
         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
             <Search size={18} />
         </div>
         <input 
             type="text" 
             value={searchQuery}
             onChange={handleSearch}
             placeholder={`Cari Chapter, Contoh: 69 atau 76`} 
             className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-gray-200 focus:outline-none focus:border-[#8b5cf6] transition placeholder:text-gray-600"
         />
         <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-800 p-1.5 rounded text-gray-400">
             <List size={14} />
         </div>
      </div>

      {/* === CHAPTER LIST === */}
      <div className="bg-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-darker flex justify-between items-center">
          <h3 className="font-bold text-white">Daftar Chapter</h3>
          <span className="text-xs text-gray-500">{filteredChapters.length} Chapter</span>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter) => {
              // Cek apakah ini chapter terakhir dibaca
              const isLastRead = lastRead === chapter.slug;

              return (
                <Link 
                  key={chapter._id} 
                  href={`/read/${slug}/${chapter.slug}`}
                  onClick={() => handleChapterClick(chapter.slug)}
                  className={`flex items-center justify-between p-3 border-b border-gray-800/50 last:border-0 transition group relative ${
                    isLastRead 
                        ? 'bg-primary/10 hover:bg-primary/20 border-l-4 border-l-primary' // Style khusus history
                        : 'hover:bg-gray-800 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-bold transition ${
                        isLastRead 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'
                    }`}>
                      Ch. {chapter.chapter_index || chapter.title.replace(/\D/g,'')}
                    </span>
                    
                    <div className="flex flex-col">
                        <span className={`text-sm font-medium line-clamp-1 ${isLastRead ? 'text-primary' : 'text-gray-300 group-hover:text-white'}`}>
                            {chapter.title || `Chapter ${chapter.chapter_index}`}
                        </span>
                        {isLastRead && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5 font-bold">
                                <History size={10} /> Terakhir dibaca
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 flex flex-col items-end gap-1">
                     <span className="flex items-center gap-1">
                        <Clock size={10}/> {new Date(chapter.createdAt || Date.now()).toLocaleDateString('id-ID')}
                     </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
                Chapter "{searchQuery}" tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}