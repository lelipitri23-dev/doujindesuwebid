'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Home, Settings, Play, Pause, List, 
  ChevronRight, X, CheckSquare, Square, ChevronDown,
  Loader2 
} from 'lucide-react';

// === 1. KOMPONEN KHUSUS GAMBAR (DIGABUNG & DIKELUARKAN DARI FUNGSI UTAMA) ===
function MangaPage({ src, index }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full min-h-[40vh] bg-[#0a0a0a] flex items-center justify-center">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-gray-500">
           <Loader2 className="animate-spin text-primary w-10 h-10 mb-2" />
           <span className="text-xs font-mono">Loading Page {index + 1}...</span>
        </div>
      )}
      
      <img 
        src={src} 
        alt={`Page ${index + 1}`} 
        onLoad={() => setIsLoading(false)}
        
        // --- FITUR SECURITY (Anti Save/Copy) ---
        onContextMenu={(e) => {
            e.preventDefault(); 
            return false;
        }}
        draggable="false"
        
        // --- STYLING (Gapless & User Select None) ---
        className={`w-full h-auto block object-contain select-none touch-none transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        
        // --- KHUSUS IOS ---
        style={{ 
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            userSelect: 'none'
        }}
        
        loading="lazy" 
      />
    </div>
  );
}

// === 2. KOMPONEN UTAMA READER ===
export default function ReaderViewer({ chapter, manga, prevChapter, nextChapter, mangaSlug }) {
  // --- STATES UI ---
  const [showUI, setShowUI] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // --- STATES FITUR ---
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const scrollInterval = useRef(null);

  // Initial Load
  useEffect(() => {
    const isHidden = localStorage.getItem('reader_notice_hidden');
    if (!isHidden) {
      setShowNotice(true);
    }
    const timer = setTimeout(() => setShowUI(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Logic Auto Scroll
  useEffect(() => {
    if (isAutoScrolling) {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
      const step = 1; 
      const baseDelay = 15; 
      const delay = baseDelay / scrollSpeed;

      scrollInterval.current = setInterval(() => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            setIsAutoScrolling(false);
            clearInterval(scrollInterval.current);
            return;
        }
        window.scrollBy(0, step);
      }, delay);
    } else {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    }
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  const handleCloseNotice = () => {
    if (dontShowAgain) {
      localStorage.setItem('reader_notice_hidden', 'true');
    }
    setShowNotice(false);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
    if (!isAutoScrolling) setShowUI(false);
  };

  // === 3. GLOBAL LOADING STATE (Jika Data Belum Ada) ===
  if (!chapter || !chapter.images) {
      return (
        <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
            <p className="animate-pulse">Memuat Chapter...</p>
        </div>
      );
  }

  return (
    <div className="relative min-h-screen bg-[#111] text-white font-sans selection:bg-primary/30">
      
      {/* HEADER */}
      <div className={`fixed top-0 left-0 w-full z-40 transition-transform duration-300 ease-in-out ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gray-800 p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link href={`/manga/${mangaSlug}`} className="p-2 hover:bg-gray-700 rounded-full transition text-gray-300 hover:text-white">
              <ArrowLeft size={22} />
            </Link>
            <div className="flex flex-col">
               <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md leading-tight text-white">
                 {manga.title}
               </h1>
               <span className="text-xs text-primary font-medium">
                 Chapter {chapter.title}
               </span>
            </div>
          </div>
          <Link href="/" className="p-2 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white">
            <Home size={22} />
          </Link>
        </div>
      </div>

      {/* CONTENT (IMAGES) */}
      <div 
        onClick={() => setShowUI(!showUI)}
        className="min-h-screen flex flex-col items-center pb-32 pt-0 md:pt-16 cursor-pointer bg-[#111]"
      >
        <div className={`w-full transition-all duration-300 ${showUI ? 'h-16' : 'h-0'} md:hidden`}></div>

        {/* CONTAINER GAMBAR */}
        <div className="w-full max-w-3xl flex flex-col">
            {chapter.images.map((imgUrl, index) => (
              <MangaPage key={index} src={imgUrl} index={index} />
            ))}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-3xl mt-8 px-4 flex gap-3 mb-24" onClick={(e) => e.stopPropagation()}>
            {prevChapter ? (
                <Link href={`/read/${mangaSlug}/${prevChapter.slug || prevChapter}`} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-center py-3 rounded-lg font-bold text-sm transition">
                    Prev
                </Link>
            ) : (
                <button disabled className="flex-1 bg-gray-900 text-gray-600 text-center py-3 rounded-lg font-bold text-sm cursor-not-allowed">Prev</button>
            )}
            
            {nextChapter ? (
                <Link href={`/read/${mangaSlug}/${nextChapter.slug || nextChapter}`} className="flex-1 bg-primary hover:bg-blue-600 text-white text-center py-3 rounded-lg font-bold text-sm transition shadow-lg shadow-blue-900/20">
                    Next Chapter
                </Link>
            ) : (
                <button disabled className="flex-1 bg-gray-900 text-gray-600 text-center py-3 rounded-lg font-bold text-sm cursor-not-allowed">End</button>
            )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className={`fixed bottom-6 left-0 w-full z-40 px-4 transition-transform duration-300 ease-in-out ${showUI ? 'translate-y-0' : 'translate-y-[200%]'}`}>
         <div className="max-w-[350px] mx-auto bg-[#222]/95 backdrop-blur-xl border border-gray-700/50 rounded-full px-6 py-2 shadow-2xl flex items-center justify-between">
            <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition group">
                <div className="p-2 rounded-full group-hover:bg-gray-700/50">
                    <Home size={20} />
                </div>
            </Link>

            <button onClick={() => setShowSettings(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition group">
                <div className="p-2 rounded-full group-hover:bg-gray-700/50">
                    <Settings size={20} />
                </div>
            </button>

            <div className="relative -top-6">
                <button 
                    onClick={toggleAutoScroll}
                    className={`flex flex-col items-center justify-center w-14 h-14 border-[4px] border-[#111] rounded-full shadow-lg text-white transition active:scale-95 ${
                        isAutoScrolling ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-primary'
                    }`}
                >
                    {isAutoScrolling ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-1" />}
                </button>
            </div>

            <Link href={`/manga/${mangaSlug}`} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition group">
                <div className="p-2 rounded-full group-hover:bg-gray-700/50">
                    <List size={20} />
                </div>
            </Link>

            {nextChapter ? (
                 <Link href={`/read/${mangaSlug}/${nextChapter.slug || nextChapter}`} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition group">
                    <div className="p-2 rounded-full group-hover:bg-gray-700/50">
                        <ChevronRight size={24} />
                    </div>
                </Link>
            ) : (
                <button disabled className="flex flex-col items-center gap-1 text-gray-600 cursor-not-allowed">
                    <div className="p-2">
                        <ChevronRight size={24} />
                    </div>
                </button>
            )}
         </div>
      </div>

      {/* MODAL SETTINGS */}
      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowSettings(false)}>
            <div className="bg-[#111] w-full max-w-sm rounded-xl p-6 shadow-2xl border border-gray-800 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="mb-6">
                    <label className="text-sm font-bold text-white mb-2 block">Page Quality</label>
                    <div className="relative">
                        <button className="w-full bg-[#1a1a1a] text-left text-gray-300 text-sm px-4 py-3 rounded-lg border border-gray-700 flex justify-between items-center hover:border-gray-600 transition">
                            <span>Select mirror url</span>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
                <div className="mb-8">
                    <label className="text-sm font-bold text-white mb-4 block">Autoscroll Speed</label>
                    <div className="relative w-full h-6 flex items-center">
                        <input 
                            type="range" min="0.5" max="1.5" step="0.1" value={scrollSpeed}
                            onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                        <span>0.5</span><span>0.75</span><span className="text-white">1.0</span><span>1.25</span><span>1.5</span>
                    </div>
                    <p className="text-center text-primary text-xs font-bold mt-2">Current: {scrollSpeed}x</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowSettings(false)} className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-lg text-sm transition shadow-[0_0_15px_rgba(139,92,246,0.3)]">Save</button>
                    <button onClick={() => setShowSettings(false)} className="flex-1 bg-transparent hover:bg-gray-800 text-white font-medium py-3 rounded-lg text-sm transition">Later</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL NOTICE */}
      {showNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-800 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-white font-bold text-center mb-4 text-base leading-relaxed">Tekan Gambar Komik Untuk Mode Full Screen</h3>
            <div className="w-full h-px bg-gray-700/50 my-4"></div>
            <div className="flex items-center gap-3 mb-6 cursor-pointer group" onClick={() => setDontShowAgain(!dontShowAgain)}>
                {dontShowAgain ? <CheckSquare className="text-primary" size={15} /> : <Square className="text-gray-500 group-hover:text-gray-400" size={15} />}
                <span className="text-sm text-gray-300 select-none group-hover:text-white">Jangan Tampilkan Lagi</span>
            </div>
            <button onClick={handleCloseNotice} className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-lg transition shadow-lg shadow-purple-900/20 active:scale-95">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}