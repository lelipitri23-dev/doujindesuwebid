import { SITE_CONFIG } from '@/lib/config';
import ReaderViewer from '@/components/ReaderViewer'; 
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

// --- FETCH DATA ---
async function getChapterData(slug, chapterSlug) {
  try {
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/read/${slug}/${chapterSlug}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

// --- GENERATE METADATA ---
export async function generateMetadata({ params }) {
  // Await params karena di Next.js terbaru params adalah Promise
  const { slug, chapterSlug } = await params; 
  const res = await getChapterData(slug, chapterSlug);

  // Jika data tidak ditemukan
  if (!res || !res.success || !res.data) {
    return { 
      title: 'Chapter Tidak Ditemukan - 404',
      robots: { index: false, follow: false } 
    };
  }

  const { chapter, manga } = res.data;
  
  // Format Judul & Deskripsi
  const pageTitle = `Baca ${manga.title} Chapter ${chapter.title} Bahasa Indonesia`;
  const pageDesc = `Baca ${manga.title} Chapter ${chapter.title} bahasa Indonesia terbaru dengan kualitas tinggi di ${SITE_CONFIG.name}.`;
  const pageUrl = `${SITE_CONFIG.baseUrl}/read/${slug}/${chapterSlug}`;
  const keywords = [manga.title, `Chapter ${chapter.title}`, manga.metadata?.type, SITE_CONFIG.name].filter(Boolean).join(', ');

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      type: 'article',
      images: [
        {
          url: manga.thumb,
          width: 800,
          height: 600,
          alt: `${manga.title} Chapter ${chapter.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [manga.thumb],
    },
    robots: { 
      index: true, 
      follow: true 
    }
  };
}

// --- MAIN PAGE ---
export default async function ReadPage({ params }) {
  const { slug, chapterSlug } = await params;
  
  const chapterRes = await getChapterData(slug, chapterSlug);
  
  // Error Handling jika data kosong
  if (!chapterRes || !chapterRes.success || !chapterRes.data) {
    return (
      <main className="min-h-screen bg-dark">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle size={64} className="mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-white">Chapter Tidak Ditemukan</h1>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded mt-6 inline-block text-sm">Kembali ke Home</Link>
        </div>
      </main>
    );
  }
  
  const { chapter, manga, navigation } = chapterRes.data;

  // JSON-LD untuk SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.baseUrl },
      { "@type": "ListItem", "position": 2, "name": manga.title, "item": `${SITE_CONFIG.baseUrl}/manga/${slug}` },
      { "@type": "ListItem", "position": 3, "name": `Chapter ${chapter.title}` }
    ]
  };

  return (
    <>
      {/* Inject SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Panggil Client Component untuk UI Reader yang Interaktif */}
      <ReaderViewer 
        chapter={chapter}
        manga={manga}
        mangaSlug={slug}
        prevChapter={navigation.prev}
        nextChapter={navigation.next}
      />
    </>
  );
}