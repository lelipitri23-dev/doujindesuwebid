import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function MangaCard({ manga }) {
  if (!manga) return null;

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <Link href={`/manga/${manga.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Badge Type */}
          <span className="absolute top-2 left-2 z-10 bg-primary text-[10px] font-bold text-white px-2 py-0.5 rounded shadow uppercase">
            {manga.metadata?.type || 'Manga'}
          </span>
          
          {/* Badge Rating */}
          <span className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-yellow-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Star size={10} fill="currentColor" /> {manga.metadata?.rating || 'N/A'}
          </span>

          <Image
            src={manga.thumb || '/placeholder.jpg'}
            alt={manga.title}
            fill
            className="object-cover group-hover:scale-110 transition duration-500"
            unoptimized // Wajib jika gambar dari external domain
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
        </div>

        <div className="p-3 absolute bottom-0 w-full">
          <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1 group-hover:text-primary transition">
            {manga.title}
          </h3>
          <div className="flex justify-between items-center text-[10px] text-gray-400">
             <span>{manga.chapter_count ? `${manga.chapter_count} Chapter` : 'Update Baru'}</span>
             <span className={`w-2 h-2 rounded-full ${manga.metadata?.status === 'Finished' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
          </div>
        </div>
      </Link>
    </div>
  );
}