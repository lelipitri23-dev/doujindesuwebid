import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Heart } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config'; 

export default function Footer() {
  return (
    <footer className="bg-card border-t border-gray-800 pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        
        {/* Bagian Atas: 3 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            
            {/* Kolom 1: Brand */}
            <div className="space-y-4">
                <Link href="/" className="text-2xl font-bold text-white flex items-center gap-1">
                    <span className="bg-primary px-2 rounded text-white uppercase">
                        {SITE_CONFIG.name.slice(0, 5)}
                    </span>
                    <span className="uppercase">
                        {SITE_CONFIG.name.slice(5)}
                    </span>
                </Link>
                <p className="text-gray-400 text-sm leading-relaxed">
                    UPDATE Doujinshi setiap hari hanya di Doujindesu. Doujinshi disini bermuatan konten dewasa, jadi sesuaikanlah dengan bijak antara bacaan anda dengan umur anda. Semua doujin disini hanya fiktif belaka.
                </p>
            </div>

            {/* Kolom 2: Link Cepat */}
            <div className="flex flex-col gap-2">
                <h3 className="text-white font-bold mb-2 border-l-4 border-primary pl-3">TAUTAN</h3>
                <Link href="/list" className="text-gray-400 hover:text-primary transition text-sm">Daftar Manga</Link>
                <Link href="/list?type=Manhwa" className="text-gray-400 hover:text-primary transition text-sm">Manhwa</Link>
                <Link href="/list?type=Manhua" className="text-gray-400 hover:text-primary transition text-sm">Manhua</Link>
                <Link href="/list?type=Doujinshi" className="text-gray-400 hover:text-primary transition text-sm">Doujinshi</Link>
            </div>

            {/* Kolom 3: Social & Support */}
            <div>
                <h3 className="text-white font-bold mb-4 border-l-4 border-primary pl-3">IKUTI KAMI</h3>
                <div className="flex gap-4 mb-6">
                    {/* Facebook */}
                    <a 
                        href={SITE_CONFIG.socials.facebook} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-darker p-2 rounded hover:bg-[#1877F2] hover:text-white text-gray-400 transition"
                    >
                        <Facebook size={20} />
                    </a>

                    {/* Twitter */}
                    <a 
                        href={SITE_CONFIG.socials.twitter} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-darker p-2 rounded hover:bg-[#1DA1F2] hover:text-white text-gray-400 transition"
                    >
                        <Twitter size={20} />
                    </a>

                    {/* Instagram */}
                    <a 
                        href={SITE_CONFIG.socials.instagram} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-darker p-2 rounded hover:bg-[#E1306C] hover:text-white text-gray-400 transition"
                    >
                        <Instagram size={20} />
                    </a>

                    {/* Github */}
                    <a 
                        href={SITE_CONFIG.socials.github} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-darker p-2 rounded hover:bg-gray-600 hover:text-white text-gray-400 transition"
                    >
                        <Github size={20} />
                    </a>
                </div>
                
                <p className="text-gray-500 text-xs">
                    Email: support@{SITE_CONFIG.baseUrl.replace(/^https?:\/\//, '').split(':')[0]}
                </p>
            </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. Made with <Heart size={14} className="text-red-500 fill-red-500" />
            </p>
        </div>
      </div>
    </footer>
  );
}