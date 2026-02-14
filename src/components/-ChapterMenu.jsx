'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookOpen, X, List } from 'lucide-react';

export default function ChapterMenu({ chapters = [], currentSlug, mangaSlug }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeRef = useRef(null);

  // Auto-scroll ke chapter yang sedang aktif saat menu dibuka
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  // Fungsi Render Item List (Dipakai ulang untuk Mobile & Desktop)
  const renderList = () => (
    <div className="space-y-1 p-2">
      {chapters.map((chap) => {
        const isActive = chap.slug === currentSlug;
        return (
          <Link
            key={chap._id}
            href={`/read/${mangaSlug}/${chap.slug}`}
            // Pasang ref hanya jika ini adalah chapter yang sedang aktif
            ref={isActive ? activeRef : null} 
            onClick={() => setIsOpen(false)} // Tutup menu saat diklik (Mobile)
            className={`block px-4 py-3 rounded-lg text-xs md:text-sm transition border ${
              isActive
                ? 'bg-primary text-white border-primary font-bold shadow-md'
                : 'bg-darker text-gray-400 hover:text-white hover:bg-gray-800 border-transparent hover:border-gray-700'
            }`}
          >
            <span className="flex justify-between items-center">
                <span>Chapter {chap.chapter_index || chap.title}</span>
                {isActive && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* === TAMPILAN DESKTOP (SIDEBAR STATIS) === */}
      <div className="hidden lg:flex w-full flex-col h-full max-h-[calc(100vh-100px)] sticky top-24">
        <div className="bg-card border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
          <div className="p-4 bg-darker border-b border-gray-800 font-bold text-white flex items-center gap-2 shadow-sm z-10">
            <BookOpen size={18} className="text-primary" />
            <span className="text-sm uppercase tracking-wide">Daftar Chapter</span>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 bg-card">
            {renderList()}
          </div>
        </div>
      </div>

      {/* === TAMPILAN MOBILE (FLOATING BUTTON & BOTTOM SHEET) === */}
      <div className="lg:hidden">
        
        {/* 1. Tombol Melayang (Floating Action Button) */}
        {!isOpen && (
            <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-2xl border border-white/20 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 group"
            >
            <List size={20} className="group-hover:rotate-180 transition duration-300" />
            <span className="font-bold text-xs pr-1">Chapter</span>
            </button>
        )}

        {/* 2. Overlay Background (Gelap) */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* 3. Bottom Sheet (Panel Daftar Chapter) */}
        <div 
            className={`fixed bottom-0 left-0 w-full bg-card border-t border-gray-800 rounded-t-2xl z-50 shadow-2xl transform transition-transform duration-300 ease-out max-h-[80vh] flex flex-col ${
                isOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            {/* Header Mobile */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-darker rounded-t-2xl sticky top-0 z-10">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase">
                    <BookOpen size={18} className="text-primary"/> 
                    Pilih Chapter
                </h3>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="bg-gray-800 hover:bg-red-500 hover:text-white text-gray-400 p-1 rounded-full transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* List Mobile (Scrollable) */}
            <div className="overflow-y-auto custom-scrollbar p-2 flex-1 bg-card pb-8">
                {renderList()}
            </div>
        </div>
      </div>
    </>
  );
}