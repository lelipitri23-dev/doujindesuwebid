import { getHomeData } from '@/lib/api';
import Navbar from '@/components/Navbar';
import TrendingSlider from '@/components/TrendingSlider';
import MangaSection from '@/components/MangaSection';
import AdBanner from '@/components/AdBanner';
import SyncBanner from '@/components/SyncBanner';

export const revalidate = 300;

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Baca & Download Doujinshi Bahasa Indonesia`,
  description: `Baca & Download Doujinshi Bahasa Indonesia Update chapter terbaru setiap hari di ${process.env.NEXT_PUBLIC_SITE_NAME}!`,
};

export default async function HomePage() {
  const res = await getHomeData();
  const data = res?.data || {};

  const { recents = [], trending = [], manhwas = [], doujinshis = [], mangas = [] } = data;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      
      <main className="pt-14 pb-safe max-w-2xl mx-auto">
        <SyncBanner />
        {/* Trending Hero Slider */}
        <TrendingSlider trending={trending} />

        {/* Iklan — di bawah slider, sebelum filter */}
        <AdBanner slot="HEADER_BANNER" className="px-4 my-2" />

        {/* Quick type filters */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Terbaru', href: '/manga?order=latest' },
            { label: 'Populer', href: '/manga?order=popular' },
            { label: 'Manga', href: '/manga?type=manga' },
            { label: 'Manhwa', href: '/manga?type=manhwa' },
            { label: 'Doujinshi', href: '/manga?type=doujinshi' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-none text-xs font-bold px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-text-secondary hover:border-accent-red hover:text-accent-red transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Manhwa */}
        {manhwas.length > 0 && (
          <MangaSection
            title="MANHWA"
            mangas={manhwas}
            href="/manga?type=manhwa"
          />
        )}

        {/* Iklan — di antara section konten */}
        <AdBanner slot="IN_CONTENT" className="px-4 my-3" />

        {/* Doujinshi */}
        {doujinshis.length > 0 && (
          <MangaSection
            title="DOUJINSHI"
            mangas={doujinshis}
            href="/manga?type=doujinshi"
          />
        )}

        {/* Manga */}
        {mangas.length > 0 && (
          <MangaSection
            title="MANGA"
            mangas={mangas}
            href="/manga?type=manga"
          />
        )}

        {/* Footer */}
        <footer className="px-4 pt-6 pb-2 border-t border-border mt-4">
          <div className="flex justify-center gap-4 mb-2">
            <a href="/privacy-policy" className="text-xs text-text-secondary hover:text-accent-red">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-text-secondary hover:text-accent-red">
              Terms of Service
            </a>
          </div>
          <p className="text-center text-text-muted text-xs">
            © 2026 {process.env.NEXT_PUBLIC_SITE_NAME} · Baca & Download Doujinshi Bahasa Indonesia
          </p>
        </footer>
      </main>
    </div>
  );
}
