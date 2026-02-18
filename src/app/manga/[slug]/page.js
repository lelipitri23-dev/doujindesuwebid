import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';
import MangaCard from '@/components/MangaCard';
import ChapterList from '@/components/ChapterList';
import { Star, AlertCircle, List, Eye, Play, FileText, Layers } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';

// --- FETCH DATA ---
async function getMangaDetail(slug) {
    try {
        const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga/${slug}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Error fetching manga:", e);
        return null;
    }
}

// --- GENERATE METADATA (SEO) ---
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const res = await getMangaDetail(slug);

    if (!res || !res.success || !res.data) {
        return {
            title: 'Manga Tidak Ditemukan - 404',
            robots: { index: false, follow: false }
        };
    }

    const manga = res.data.info || {};
    const pageTitle = `Baca ${manga.metadata?.type || 'Komik'} ${manga.title} Bahasa Indonesia`;
    const pageDesc = `Baca ${manga.metadata?.type || 'Komik'} ${manga.title} Download ${manga.metadata?.type || 'Komik'} ${manga.title} Bahasa Indonesia.`;
    const pageUrl = `${SITE_CONFIG.baseUrl}/manga/${slug}`;
    const keywords = [manga.title, manga.alternativeTitle, manga.metadata?.author, manga.metadata?.artist, ...(manga.tags || [])].filter(Boolean).join(', ');

    return {
        title: pageTitle,
        description: pageDesc,
        keywords: keywords,
        alternates: {
            canonical: pageUrl
        },
        openGraph: {
            title: pageTitle,
            description: pageDesc,
            url: pageUrl,
            siteName: SITE_CONFIG.name,
            images: [
                {
                    url: manga.thumb,
                    width: 800,
                    height: 600,
                    alt: manga.title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDesc,
            images: [manga.thumb],
        },
        robots: { index: true, follow: true }
    };
}

// --- COMPONENT HELPER: METADATA ROW ---
const MetaRow = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-gray-800/50 pb-3 last:border-0">
        <span className="text-gray-400 font-bold text-xs w-20 flex-shrink-0 uppercase tracking-wide">{label}</span>
        <div className="flex-1 flex flex-wrap gap-2 text-sm text-gray-200">
            {children}
        </div>
    </div>
);

// --- COMPONENT HELPER: PILL ---
const Pill = ({ text, href }) => {
    if (href) {
        return (
            <Link href={href} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 hover:text-white transition">
                {text}
            </Link>
        )
    }
    return (
        <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">
            {text}
        </span>
    )
}

export default async function MangaDetail({ params }) {
    const { slug } = await params;
    const res = await getMangaDetail(slug);

    // 1. Validasi Data
    if (!res || !res.success || !res.data) {
        return (
            <main className="min-h-screen bg-[#111]">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <AlertCircle size={64} className="text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-white">Komik Tidak Ditemukan</h1>
                    <Link href="/" className="mt-6 bg-primary text-white px-6 py-2 rounded-full font-bold">Home</Link>
                </div>
            </main>
        );
    }

    // 2. AMBIL DATA
    const { info: manga = {}, chapters = [], recommendations = [] } = res.data;

    // Logic Chapter Awal & Akhir
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    // Asumsi chapter[0] adalah chapter terbaru (teratas)
    const latestChapter = chapters.length > 0 ? chapters[0] : null;

    // JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ComicSeries',
        name: manga.title,
        image: manga.thumb,
        description: manga.synopsis,
        author: { '@type': 'Person', name: manga.metadata?.author || 'Unknown' },
    };

    return (
        <main className="min-h-screen bg-[#111] font-sans text-gray-200 pb-20">
            <Navbar />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* === HERO SECTION === */}
            <div className="relative w-full overflow-hidden mb-8">

                {/* Background Blur */}
                <div className="absolute inset-0 h-[500px] w-full z-0">
                    {manga.thumb && (
                        <Image
                            src={manga.thumb}
                            fill
                            className="object-cover blur-[-10px] opacity-20"
                            alt="bg"
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 pt-8 sm:pt-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* 1. COVER IMAGE (Kiri) */}
                        <div className="w-[180px] sm:w-[240px] flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl border border-gray-700/50 aspect-[3/4] relative group">
                            {manga.thumb ? (
                                <Image src={manga.thumb} fill className="object-cover transition-transform duration-500 group-hover:scale-105" alt={manga.title} unoptimized />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">No Image</div>
                            )}
                        </div>

                        {/* 2. INFO DETAILS (Kanan) */}
                        <div className="flex-1 w-full">
                            {/* Title */}
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-2 text-center md:text-left">
                                {manga.title}
                            </h1>
                            {manga.alternativeTitle && (
                                <p className="text-gray-400 text-sm mb-6 font-medium text-center md:text-left">
                                    {manga.alternativeTitle}
                                </p>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center gap-3 mb-6 w-full sm:max-w-md mx-auto md:mx-0">
                                {firstChapter && (
                                    <Link
                                        href={`/read/${manga.slug}/${firstChapter.slug}`}
                                        className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] text-xs uppercase tracking-wide"
                                    >
                                        <Play size={16} className="fill-white" /> BACA
                                    </Link>
                                )}

                                <div className="flex-1">
                                    <BookmarkButton manga={manga} />
                                </div>
                            </div>

                            {/* Anchor ID Info */}
                            <div id="info" className="scroll-mt-24"></div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-gray-400 mb-6 border-y border-gray-800 py-4">
                                <div className="flex items-center gap-1.5">
                                    <Star className="text-yellow-500 fill-yellow-500" size={18} />
                                    <strong className="text-white">{manga.metadata?.rating || 'N/A'}</strong>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <List size={18} />
                                    <strong className="text-white">{chapters.length}</strong> <span className="hidden sm:inline">Chapter</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Eye size={18} />
                                    <strong className="text-white">{manga.views || '0'}</strong> <span className="hidden sm:inline">Views</span>
                                </div>
                                <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 border border-gray-700 text-gray-300">
                                    {manga.metadata?.status || 'Ongoing'}
                                </div>
                            </div>

                            {/* Synopsis */}
                            <div className="mb-6">
                                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                                    {manga.synopsis || "Belum ada sinopsis untuk komik ini."}
                                </p>
                            </div>

                            {/* === SEO CONTENT SNIPPET (Added Here) === */}
                            <div className="entry-content entry-content-single maincontent mb-8 text-sm text-gray-400 bg-gray-900/30 p-4 rounded-lg border border-gray-800/50" itemProp="description">
                                <div className="chdesc">
                                    <p>
                                        Baca {manga.metadata?.type || 'Komik'} <b className="text-white">{manga.title}</b> {latestChapter ? `Chapter ${latestChapter.title}` : ''} bahasa Indonesia terbaru di <b className="text-white">{SITE_CONFIG.name}</b>.
                                        {manga.metadata?.type || 'Komik'} <b className="text-white">{manga.title}</b> bahasa Indonesia selalu update di <b className="text-white">{SITE_CONFIG.name}</b>.
                                        Jangan lupa membaca update manga lainnya ya. Daftar koleksi {manga.metadata?.type || 'Komik'} <b className="text-white"></b> ada di menu Daftar.
                                    </p>
                                </div>
                            </div>
                            {/* === END SEO CONTENT === */}

                            {/* Metadata Grid */}
                            <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-gray-800/50">
                                <MetaRow label="Genre">
                                    {manga.tags?.map(tag => (
                                        <Pill key={tag} text={tag} href={`/list?genre=${tag}`} />
                                    ))}
                                </MetaRow>

                                <MetaRow label="Author">
                                    <Pill text={manga.metadata?.author || '-'} />
                                </MetaRow>

                                <MetaRow label="Artist">
                                    <Pill text={manga.metadata?.artist || manga.metadata?.author || '-'} />
                                </MetaRow>
                                <MetaRow label="Created">
                                    <Pill text={manga.metadata?.created || '-'} />
                                </MetaRow>

                                <div className="flex flex-col sm:flex-row sm:gap-8 gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-wide w-20 sm:w-16">Format</span>
                                        <Pill text={manga.metadata?.series || 'Original'} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-wide w-20 sm:w-auto">Type</span>
                                        <Pill text={manga.metadata?.type || 'Komik'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === CONTENT SECTION (Chapter List) === */}
            <div className="container mx-auto px-4">

                {/* Tabs Header */}
                <div className="flex items-center gap-6 border-b border-gray-800 mb-6">
                    <button className="flex items-center gap-2 pb-3 border-b-2 border-[#8b5cf6] text-[#8b5cf6] font-bold">
                        <List size={18} /> Chapters
                    </button>

                    <a
                        href="#info"
                        className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-medium transition"
                    >
                        <FileText size={18} /> Info
                    </a>
                </div>

                {/* Chapter List Component (Include Search & History) */}
                <ChapterList
                    chapters={chapters}
                    slug={manga.slug}
                />

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Layers className="text-primary" /> Anda Mungkin Suka
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {recommendations.map(item => (
                                <MangaCard key={item._id} manga={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}