'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, List, ArrowLeft, X,
  ChevronLeft, ChevronRight, Home,
  Play, Pause, CircleAlert, Download
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import { useAuth } from '@/context/AuthContext';

const RAW_FREE_DOWNLOAD_CHAPTER_LIMIT = Number.parseInt(
  process.env.NEXT_PUBLIC_FREE_DOWNLOAD_CHAPTER_LIMIT || '5',
  10
);
const FREE_DOWNLOAD_CHAPTER_LIMIT = Number.isFinite(RAW_FREE_DOWNLOAD_CHAPTER_LIMIT) && RAW_FREE_DOWNLOAD_CHAPTER_LIMIT > 0
  ? RAW_FREE_DOWNLOAD_CHAPTER_LIMIT
  : 5;

// Gambar dengan proteksi klik kanan & tap lama
function ProtectedImage({ src, alt, className }) {
  const longPressTimer = useRef(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => { }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      style={{ WebkitTouchCallout: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    />
  );
}

function normalizeChapterImageUrl(rawUrl) {
  if (!rawUrl) return '';

  let url = String(rawUrl).trim();
  url = url.replace(
    /^https?:\/\/cdn\.manhwature\.com\/desu\.photos\//i,
    'https://desu.photos/'
  );
  url = url.replace(
    /^https?:\/\/desu\.photos\/uploads\//i,
    'https://desu.photos/storage/uploads/'
  );
  url = url.replace(
    /^https?:\/\/desu\.photos\/storage\/storage\/uploads\//i,
    'https://desu.photos/storage/uploads/'
  );

  if (/^https?:\/\/desu\.photos\//i.test(url)) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

async function imageUrlToJpegData(src, quality = 0.84) {
  const res = await fetch(src, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Gagal memuat gambar (${res.status})`);

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal decode gambar'));
      el.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context tidak tersedia');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', quality),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getDownloadHistoryStorageKey(uid) {
  return `pdf_downloaded_chapters_${uid}`;
}

function readDownloadedChapterKeys(uid) {
  if (!uid || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getDownloadHistoryStorageKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === 'string' && v.trim().length > 0);
  } catch {
    return [];
  }
}

function saveDownloadedChapterKeys(uid, chapterKeys) {
  if (!uid || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getDownloadHistoryStorageKey(uid),
      JSON.stringify(chapterKeys)
    );
  } catch {
    // Ignore quota/storage errors.
  }
}

export default function ReaderClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { slug, chapterSlug } = params;

  const [data, setData] = useState(null);
  const [chapterList, setChapterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUI, setShowUI] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [progress, setProgress] = useState(0);
  const [imageWidth, setImageWidth] = useState(800);
  const [fitToWidth, setFitToWidth] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadedChapterKeys, setDownloadedChapterKeys] = useState([]);

  const lastScrollY = useRef(0);
  const scrollInterval = useRef(null);

  // Blokir klik kanan
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, []);

  // Fetch data chapter
  useEffect(() => {
    async function initReader() {
      setLoading(true);
      setError(null);
      try {
        const proxyBase = `${window.location.origin}/api/proxy`;

        const resRead = await fetch(`${proxyBase}/read/${slug}/${chapterSlug}`);
        if (!resRead.ok) throw new Error(`HTTP ${resRead.status}`);
        const jsonRead = await resRead.json();

        if (!jsonRead.success) throw new Error(jsonRead.message || 'Gagal memuat chapter');
        setData(jsonRead.data);

        // ── Simpan history ke backend (jika user login) ──
        const readData = jsonRead.data;
        if (user?.uid && readData?.manga && readData?.chapter) {
          const manga = readData.manga;
          const chapter = readData.chapter;
          fetch(`${proxyBase}/users/${user.uid}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: manga.metadata?.type || manga.type || 'manga',
              slug: manga.slug,
              title: manga.title,
              thumb: manga.thumb || manga.coverImage || '',
              lastChapterTitle: chapter.title,
              lastChapterSlug: chapter.slug,
            }),
          }).catch(err => console.warn('[History] gagal simpan:', err.message));
        }

        // Ambil daftar chapter dari endpoint manga
        try {
          const resManga = await fetch(`${proxyBase}/manga/${slug}`);
          if (resManga.ok) {
            const jsonManga = await resManga.json();
            if (jsonManga.success && jsonManga.data?.chapters) {
              setChapterList(jsonManga.data.chapters);
            }
          }
        } catch (err) {
          console.warn('Gagal load chapter list:', err.message);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    initReader();
  }, [slug, chapterSlug, user?.uid]);

  // Auto scroll
  useEffect(() => {
    if (isAutoScrolling) {
      const step = () => {
        window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          setIsAutoScrolling(false);
        }
      };
      scrollInterval.current = setInterval(step, 16);
    } else {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    }
    return () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  }, [isAutoScrolling, scrollSpeed]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const newProgress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    setProgress(newProgress);

    if (!isAutoScrolling) {
      if (scrollTop < lastScrollY.current - 10) setShowUI(true);
      else if (scrollTop > lastScrollY.current + 10 && !activeMenu) setShowUI(false);
    }
    lastScrollY.current = scrollTop;
  }, [activeMenu, isAutoScrolling]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleMenu = (menu) => {
    if (activeMenu === menu) setActiveMenu(null);
    else {
      setActiveMenu(menu);
      setIsAutoScrolling(false);
      setShowUI(true);
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
    if (!isAutoScrolling) setShowUI(false);
  };

  const isLoggedIn = !!user?.uid;
  const isUnlimitedMember = !!(user?.isPremium || user?.isAdmin);
  const maxFreeChapters = FREE_DOWNLOAD_CHAPTER_LIMIT;
  const currentChapterKey = `${slug}:${chapterSlug}`;
  const hasDownloadedCurrentChapter = downloadedChapterKeys.includes(currentChapterKey);
  const usedFreeChapterSlots = downloadedChapterKeys.length;
  const remainingFreeChapterSlots = Math.max(maxFreeChapters - usedFreeChapterSlots, 0);

  useEffect(() => {
    if (!isLoggedIn || isUnlimitedMember) {
      setDownloadedChapterKeys([]);
      return;
    }
    setDownloadedChapterKeys(readDownloadedChapterKeys(user.uid));
  }, [isLoggedIn, isUnlimitedMember, user?.uid]);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    if (!isLoggedIn) {
      window.alert('Silakan login untuk menggunakan fitur download PDF.');
      return;
    }
    if (!isUnlimitedMember && !hasDownloadedCurrentChapter && usedFreeChapterSlots >= maxFreeChapters) {
      window.alert(
        `Batas download member biasa sudah tercapai (${maxFreeChapters} chapter). Upgrade premium untuk akses tanpa batas.`
      );
      return;
    }

    const images = (data?.chapter?.images || [])
      .map((img) => normalizeChapterImageUrl(img))
      .filter(Boolean);

    if (images.length === 0) {
      window.alert('Tidak ada gambar chapter untuk diunduh.');
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      let pagesAdded = 0;

      for (const src of images) {
        try {
          const image = await imageUrlToJpegData(src);
          if (pagesAdded > 0) pdf.addPage();

          const imgH = (image.height * pageW) / image.width;
          let heightLeft = imgH;
          let position = 0;

          pdf.addImage(image.dataUrl, 'JPEG', 0, position, pageW, imgH, undefined, 'FAST');
          pagesAdded += 1;
          heightLeft -= pageH;

          while (heightLeft > 0) {
            position = heightLeft - imgH;
            pdf.addPage();
            pdf.addImage(image.dataUrl, 'JPEG', 0, position, pageW, imgH, undefined, 'FAST');
            pagesAdded += 1;
            heightLeft -= pageH;
          }
        } catch (err) {
          console.warn('[PDF] skip image:', err?.message || err);
        }
      }

      if (pagesAdded === 0) {
        window.alert('Gagal membuat PDF. Semua gambar chapter gagal diproses.');
        return;
      }

      const safeTitle = `${mangaTitle || slug || 'manga'} - ${chapterTitle || chapterSlug || 'chapter'}`
        .replace(/[\\/:*?"<>|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      pdf.save(`${safeTitle}.pdf`);

      if (!isUnlimitedMember && !hasDownloadedCurrentChapter) {
        const nextKeys = [...downloadedChapterKeys, currentChapterKey];
        saveDownloadedChapterKeys(user.uid, nextKeys);
        setDownloadedChapterKeys(nextKeys);
      }
    } catch (err) {
      window.alert(`Gagal membuat PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#080808]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-accent-red border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Memuat chapter...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#080808] gap-4 px-4">
      <CircleAlert size={48} className="text-red-500" />
      <p className="text-red-400 text-center">{error || 'Gagal memuat chapter'}</p>
      <button
        onClick={() => router.back()}
        className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold"
      >
        Kembali
      </button>
    </div>
  );

  const { chapter, manga, navigation } = data;
  const mangaTitle = manga?.title || '';
  const chapterTitle = chapter?.title || '';

  return (
    <div className="bg-[#080808] min-h-screen relative text-gray-200 font-sans select-none">

      {/* CONTENT */}
      <div
        className="min-h-screen w-full pb-32 pt-16 cursor-pointer"
        onClick={() => {
          if (activeMenu) setActiveMenu(null);
          else setShowUI(v => !v);
        }}
      >
        <div
          className="mx-auto transition-[max-width] duration-300 ease-out"
          style={{ maxWidth: fitToWidth ? '100%' : `${imageWidth}px`, padding: fitToWidth ? '0' : '0 1rem' }}
        >
          <AdBanner slot="READER_TOP" className="mb-3" />
          <div className="mb-3 rounded-xl border border-blue-500/35 bg-blue-500/10 px-3 py-2">
            <p className="text-[11px] font-semibold text-blue-200">
              Info (Beta): fitur download sudah tersedia.
            </p>
            <p className="text-[10px] text-blue-200/80 mt-0.5">
              Buka menu Pengaturan untuk mengunduh chapter dalam format PDF.
            </p>
          </div>

          {chapter.images?.length > 0 ? (
            chapter.images.map((img, idx) => (
              <ProtectedImage
                key={idx}
                src={normalizeChapterImageUrl(img)}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto block mb-0 shadow-2xl"
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <CircleAlert size={48} className="text-yellow-500" />
              <p className="text-gray-400">Tidak ada gambar di chapter ini.</p>
            </div>
          )}

          <AdBanner slot="READER_BOTTOM" className="mt-4" />
        </div>
      </div>

      {/* TOP HEADER */}
      <div className={`fixed top-0 left-0 right-0 h-14 bg-[#111]/90 backdrop-blur-md z-40 border-b border-white/5 flex items-center px-4 justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Link href={`/manga/${manga?.slug || slug}`} className="p-2 -ml-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm text-gray-100 line-clamp-1">{mangaTitle}</h1>
            <span className="text-xs text-gray-400 truncate max-w-[200px]">{chapterTitle}</span>
          </div>
        </div>
        <div className="text-[10px] font-bold tracking-wider bg-white/10 text-gray-300 px-2 py-1 rounded-md">
          {progress}%
        </div>
      </div>

      {/* BOTTOM DOCK */}
      <div className={`fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 transition-transform duration-300 ${showUI ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <div className="bg-[#0f0f0f] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-6 py-3 flex items-center gap-6 sm:gap-8 min-w-[320px] justify-between backdrop-blur-md">
          {navigation?.prev ? (
            <Link href={`/read/${slug}/${navigation.prev}`} className="text-gray-400 hover:text-white transition active:scale-95">
              <ChevronLeft size={24} />
            </Link>
          ) : (
            <span className="text-gray-700 cursor-not-allowed"><ChevronLeft size={24} /></span>
          )}

          <button
            onClick={() => toggleMenu('settings')}
            className={`transition active:scale-95 ${activeMenu === 'settings' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings size={22} />
          </button>

          <button
            onClick={toggleAutoScroll}
            className={`transition active:scale-95 ${isAutoScrolling ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            {isAutoScrolling ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>

          <button
            onClick={() => toggleMenu('chapters')}
            className={`transition active:scale-95 ${activeMenu === 'chapters' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <List size={24} />
          </button>

          <Link href={`/manga/${manga?.slug || slug}`} className="text-gray-400 hover:text-blue-400 transition active:scale-95">
            <Home size={22} />
          </Link>

          {navigation?.next ? (
            <Link href={`/read/${slug}/${navigation.next}`} className="text-gray-400 hover:text-white transition active:scale-95">
              <ChevronRight size={24} />
            </Link>
          ) : (
            <span className="text-gray-700 cursor-not-allowed"><ChevronRight size={24} /></span>
          )}
        </div>
      </div>

      {/* SETTINGS MENU */}
      {activeMenu === 'settings' && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#151515] border border-white/10 rounded-2xl shadow-2xl z-40 p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <span className="text-sm font-bold text-gray-200">Pengaturan Reader</span>
            <button onClick={() => setActiveMenu(null)}><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf || !isLoggedIn}
                className={`w-full flex items-center justify-between text-[11px] font-semibold px-3 py-2 rounded-lg border transition-colors mb-3 ${isDownloadingPdf || !isLoggedIn
                    ? 'text-gray-500 border-gray-800 cursor-not-allowed'
                    : 'text-gray-200 border-gray-700 hover:border-blue-500 hover:text-blue-400'
                  }`}
              >
                <span>
                  {isDownloadingPdf
                    ? 'MEMPROSES PDF...'
                    : !isLoggedIn
                      ? 'LOGIN UNTUK DOWNLOAD PDF'
                      : isUnlimitedMember
                        ? 'DOWNLOAD CHAPTER PDF (FULL)'
                        : `DOWNLOAD PDF (LIMIT ${maxFreeChapters} CHAPTER)`}
                </span>
                <Download size={14} />
              </button>
              {!isLoggedIn && (
                <p className="text-[10px] text-yellow-400 mb-3">
                  Fitur download PDF hanya untuk member login.
                </p>
              )}
              {isLoggedIn && !isUnlimitedMember && (
                <p className="text-[10px] text-yellow-400 mb-3">
                  Member biasa dibatasi {maxFreeChapters} chapter total. Terpakai {usedFreeChapterSlots}/{maxFreeChapters}.
                  {hasDownloadedCurrentChapter
                    ? ' Chapter ini sudah terdaftar, jadi tetap bisa diunduh ulang.'
                    : ` Sisa slot: ${remainingFreeChapterSlots}.`}
                </p>
              )}

              <div className="flex justify-between text-xs text-gray-400 mb-2 font-semibold">
                <span>LEBAR GAMBAR</span>
                <span>{fitToWidth ? 'FIT' : `${Math.round(imageWidth / 10)}%`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFitToWidth(!fitToWidth)}
                  className={`text-[10px] font-bold px-2 py-1 rounded border ${fitToWidth ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-700 text-gray-400'}`}
                >
                  FIT
                </button>
                <input
                  type="range" min="300" max="1200"
                  value={imageWidth} disabled={fitToWidth}
                  onChange={(e) => setImageWidth(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2 font-semibold">
                <span>KECEPATAN AUTO-SCROLL</span>
                <span>{scrollSpeed}x</span>
              </div>
              <input
                type="range" min="1" max="10"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER LIST MENU */}
      {activeMenu === 'chapters' && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#151515] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col max-h-[50vh]">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
            <h3 className="font-bold text-sm text-gray-200">Chapters ({chapterList.length})</h3>
            <button onClick={() => setActiveMenu(null)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="p-2 overflow-y-auto grid grid-cols-5 gap-2">
            {chapterList.length > 0 ? (
              chapterList.map((ch) => {
                const chNumber = ch.title?.replace(/Chapter\s*/i, '').trim() || ch.chapter_index || '?';
                const isCurrent = ch.slug === chapterSlug;
                return (
                  <Link
                    key={ch._id || ch.slug}
                    href={`/read/${slug}/${ch.slug}`}
                    className={`h-10 flex items-center justify-center rounded-lg text-xs font-bold transition ${isCurrent
                        ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                        : 'bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white border border-transparent hover:border-gray-600'
                      }`}
                  >
                    {String(chNumber).length > 5 ? String(chNumber).slice(0, 5) : chNumber}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-5 text-center py-6 text-gray-500 text-xs">
                Memuat daftar chapter...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
