import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye, Layers, Clock } from 'lucide-react';

export default function MangaListItem({ manga }) {
  // --- 1. NORMALISASI DATA ---
  // Kita buat variabel helper untuk mengambil data, baik dari root maupun metadata
  const type = manga.type || manga.metadata?.type || 'Manga';
  const rating = manga.rating || manga.metadata?.rating || '?';
  const status = manga.status || manga.metadata?.status || 'Ongoing';
  const views = manga.views || manga.view_count || '0'; // Coba cek view_count juga
  
  // Format Views agar lebih rapi (contoh: 1000 -> 1K)
  const formatViews = (num) => {
    try {
        const n = parseInt(num);
        if (isNaN(n)) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    } catch {
        return '0';
    }
  };

  return (
    <div className="flex gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition group shadow-sm">
      {/* Cover Image */}
      <div className="relative w-24 h-36 sm:w-28 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700">
        <Image 
            src={manga.thumb} 
            alt={manga.title} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            unoptimized
        />
        {/* Type Badge (Menggunakan variabel 'type' yang sudah diperbaiki) */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase text-white ${
            type === 'Manhwa' ? 'bg-blue-500' : 
            type === 'Manhua' ? 'bg-green-500' : 'bg-red-500'
        }`}>
            {type}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
            <Link href={`/manga/${manga.slug}`}>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition line-clamp-1 mb-1.5">
                    {manga.title}
                </h3>
            </Link>
            
            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 mb-3">
                {/* Rating */}
                <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500"/> 
                    {rating}
                </span>

                {/* Views */}
                <span className="flex items-center gap-1">
                    <Eye size={12}/> 
                    {formatViews(views)}
                </span>

                {/* Chapter Count */}
                <span className="flex items-center gap-1">
                    <Layers size={12}/> 
                    {manga.chapter_count || '?'} Ch
                </span>

                {/* Status */}
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold ${
                    status === 'Ongoing' 
                    ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                    : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                }`}>
                    {status}
                </span>
            </div>

            {/* Synopsis (Line Clamp) */}
            <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 leading-relaxed hidden sm:block">
                {manga.synopsis || "Tidak ada deskripsi tersedia untuk komik ini."}
            </p>
        </div>

        {/* Latest Chapter Button */}
        <div className="mt-2 pt-3 border-t border-gray-800 flex justify-between items-center">
             <Link 
                href={manga.last_chapter_slug ? `/read/${manga.slug}/${manga.last_chapter_slug}` : `/manga/${manga.slug}`}
                className="text-sm text-gray-300 hover:text-white font-medium bg-gray-800 hover:bg-primary hover:border-primary px-3 py-1.5 rounded-lg border border-gray-700 transition"
             >
                Chapter {manga.last_chapter || '?'}
             </Link>
             <span className="text-[10px] text-gray-600 flex items-center gap-1">
                <Clock size={10} /> Updated today
             </span>
        </div>
      </div>
    </div>
  );
}