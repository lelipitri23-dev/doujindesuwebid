'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Search, List, History, Download } from 'lucide-react';

export default function ChapterList({ chapters = [], slug }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState(chapters);
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('reading_history') || '{}');
      if (history[slug]) {
        setLastRead(history[slug]);
      }
    }
    setFilteredChapters(chapters);
  }, [slug, chapters]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = chapters.filter((chapter) => {
      const titleMatch = chapter.title?.toLowerCase().includes(query);
      const indexMatch = chapter.chapter_index?.toString().includes(query);
      const numberInTitle = chapter.title?.toLowerCase().includes(`chapter ${query}`);
      
      return titleMatch || indexMatch || numberInTitle;
    });

    setFilteredChapters(filtered);
  };

  const handleChapterClick = (chapterSlug) => {
    const history = JSON.parse(localStorage.getItem('reading_history') || '{}');
    history[slug] = chapterSlug;
    localStorage.setItem('reading_history', JSON.stringify(history));
    setLastRead(chapterSlug);
  };

  const handleDownload = (e, chapter) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    alert(`Fitur download untuk Chapter ${chapter.chapter_index || chapter.title} masih dalam tahap pengembangan.`);
  };

  const latestChapter = chapters.length > 0 
    ? chapters.reduce((prev, current) => {
        const prevIndex = Number(prev.chapter_index || prev.title?.replace(/\D/g, '') || 0);
        const currentIndex = Number(current.chapter_index || current.title?.replace(/\D/g, '') || 0);
        return (prevIndex > currentIndex) ? prev : current;
      }, chapters[0])
    : null;
  
  const latestChapterSlug = latestChapter?.slug;

  if (!chapters || chapters.length === 0) {
    return <div className="p-4 text-center text-gray-500">Belum ada chapter.</div>;
  }

  return (
    <div className="space-y-4">
      
      {/* === SEARCH BAR === */}
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
              const isLastRead = lastRead === chapter.slug;
              const isNewest = chapter.slug === latestChapterSlug;

              // 1. Ekstrak hanya angka untuk Badge
              const chapterNumber = chapter.chapter_index || chapter.title?.replace(/\D/g, '') || '';
              
              // 2. Format Judul agar otomatis menambahkan kata "Chapter" jika belum ada
              let displayTitle = chapter.title || `Chapter ${chapterNumber}`;
              if (!displayTitle.toLowerCase().includes('chapter')) {
                  if (/^\d+/.test(displayTitle.trim())) {
                      displayTitle = `Chapter ${displayTitle.trim()}`; // Misal "68" jadi "Chapter 68"
                  } else if (chapterNumber) {
                      displayTitle = `Chapter ${chapterNumber} - ${displayTitle.trim()}`; // Misal judulnya teks lain
                  }
              }

              return (
                <Link 
                  key={chapter._id} 
                  href={`/read/${slug}/${chapter.slug}`}
                  onClick={() => handleChapterClick(chapter.slug)}
                  className={`flex items-center justify-between p-3 border-b border-gray-800/50 last:border-0 transition group ${
                    isLastRead 
                        ? 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 border-l-4 border-l-[#8b5cf6]' 
                        : 'hover:bg-gray-800 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    
                    {/* ===== BADGE KIRI (Ch.68) ===== */}
                    <span className={`px-3 py-1 rounded text-xs font-bold transition ${
                        isLastRead 
                        ? 'bg-[#8b5cf6] text-white' 
                        : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'
                    }`}>
                      Ch.{chapterNumber}
                    </span>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {/* ===== JUDUL UTAMA (Chapter 68) ===== */}
                            <span className={`text-sm font-medium line-clamp-1 ${isLastRead ? 'text-[#8b5cf6]' : 'text-gray-300 group-hover:text-white'}`}>
                                {displayTitle}
                            </span>
                            
                            {isNewest && (
                                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                                    NEW
                                </span>
                            )}
                        </div>
                        {isLastRead && (
                            <span className="text-[10px] text-[#8b5cf6] flex items-center gap-1 mt-0.5 font-bold">
                                <History size={10} /> Terakhir dibaca
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-[10px] text-gray-500 flex flex-col items-end gap-1">
                       <span className="flex items-center gap-1">
                          <Clock size={10}/> {new Date(chapter.createdAt || Date.now()).toLocaleDateString('id-ID')}
                       </span>
                    </div>

                    <button 
                      onClick={(e) => handleDownload(e, chapter)}
                      className="p-1.5 bg-gray-800/80 hover:bg-[#8b5cf6] hover:text-white rounded text-gray-400 transition"
                      title="Download Chapter (Coming Soon)"
                    >
                      <Download size={14} />
                    </button>
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