'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, List, ArrowLeft, X,
  ChevronLeft, ChevronRight, Home,
  Play, Pause, CircleAlert, Download,
  ArrowUp, ArrowDown
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import { useAuth } from '@/context/AuthContext';

// Download limit sekarang dikelola oleh backend (POST /users/:googleId/download)
// 6x/HARI untuk member biasa, unlimited untuk premium/admin

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

  url = url.replace(
    /^https?:\/\/desu\.photos\/storage\/storage\/uploads\//i,
    'https://desu.photos/storage/uploads/'
  );

  if (/^https?:\/\/(images|img)\.manhwaland\.email\//i.test(url) || /^https?:\/\/desu\.photos\//i.test(url)) {
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

// Download limit dikelola oleh backend — tidak perlu localStorage lagi

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
  const [downloadCount, setDownloadCount] = useState(null);  // null = belum di-fetch
  const [downloadLimit, setDownloadLimit] = useState(6);

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
        const proxyBase = `/api`;

        const resRead = await fetch(`${proxyBase}/read/${slug}/${chapterSlug}`);
        if (!resRead.ok) throw new Error(`HTTP ${resRead.status}`);
        const jsonRead = await resRead.json();

        if (!jsonRead.success) throw new Error(jsonRead.message || 'Gagal memuat chapter');
        setData(jsonRead.data);

        // ── Simpan history ke backend (jika user login) ──
        const readData = jsonRead.data;
        if (user?.googleId && readData?.manga && readData?.chapter) {
          const manga = readData.manga;
          const chapter = readData.chapter;
          fetch(`${proxyBase}/users/${user.googleId}/history`, {
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
  }, [slug, chapterSlug, user?.googleId]);

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

  // Fetch sisa download dari backend
  useEffect(() => {
    if (!user?.googleId || user?.isPremium || user?.isAdmin) return;
    const fetchDownloadCount = async () => {
      try {
        const proxyBase = `/api`;
        const res = await fetch(`${proxyBase}/users/${user.googleId}/download/status`);
        const json = await res.json();
        if (json.success && json.data) {
          setDownloadCount(json.data.used ?? 0);
          setDownloadLimit(json.data.limit ?? 6);
        }
      } catch {
        // Gagal fetch — tidak tampilkan error, hanya skip
      }
    };
    fetchDownloadCount();
  }, [user?.uid, user?.isPremium, user?.isAdmin]);

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  const isLoggedIn = !!user?.uid;
  const isUnlimitedMember = !!(user?.isPremium || user?.isAdmin);

  // Deklarasikan lebih awal agar bisa dipakai di handleDownloadPdf
  const mangaTitle = data?.chapter && data?.manga ? (data.manga?.title || '') : '';
  const chapterTitle = data?.chapter ? (data.chapter?.title || '') : '';

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    if (!isLoggedIn) {
      window.alert('Silakan login untuk menggunakan fitur download PDF.');
      return;
    }

    // Cek limit download dari backend (kecuali premium/admin)
    if (!isUnlimitedMember) {
      try {
        const proxyBase = `/api`;
        const limitRes = await fetch(`${proxyBase}/users/${user.googleId}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const limitJson = await limitRes.json();
        if (limitJson.success && limitJson.data && !limitJson.data.allowed) {
          window.alert(limitJson.data.message || 'Batas download harian tercapai. Upgrade Premium untuk akses tanpa batas!');
          // Update count ke limit agar UI menunjukkan 0 sisa
          setDownloadCount(downloadLimit);
          return;
        }
        if (!limitJson.success) {
          window.alert('Gagal mengecek limit download. Coba lagi.');
          return;
        }
      } catch (err) {
        console.error('[Download] limit check error:', err);
        window.alert('Gagal mengecek limit download. Coba lagi.');
        return;
      }
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

      // Update sisa download di UI
      setDownloadCount((prev) => (prev !== null ? prev + 1 : null));
      // Hitungan download sudah ditambah oleh backend saat cek limit
    } catch (err) {
      window.alert(`Gagal membuat PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-accent-red border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Memuat chapter...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary gap-4 px-4">
      <CircleAlert size={48} className="text-accent-red" />
      <p className="text-text-primary text-center">{error || 'Gagal memuat chapter'}</p>
      <button
        onClick={() => router.back()}
        className="px-5 py-2.5 bg-bg-elevated text-text-primary rounded-xl text-sm font-bold"
      >
        Kembali
      </button>
    </div>
  );

  const { chapter, manga, navigation } = data;

  return (
    <div className="bg-bg-primary min-h-screen relative text-text-primary font-sans select-none">

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
            <p className="text-[10px] text-blue-200/80 mt-0.5">
              Buka menu Pengaturan (ikon Gear) di bawah untuk memproses dan mengunduh chapter.
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
              <CircleAlert size={48} className="text-accent-gold" />
              <p className="text-text-muted">Tidak ada gambar di chapter ini.</p>
            </div>
          )}

          <AdBanner slot="READER_BOTTOM" className="mt-4" />
        </div>
      </div>

      {/* TOP HEADER */}
      <div className={`fixed top-0 left-0 right-0 h-14 bg-bg-primary/95 backdrop-blur-md z-40 border-b border-border flex items-center px-4 justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Link href={`/manga/${manga?.slug || slug}`} className="p-2 -ml-2 text-text-secondary hover:text-accent-red hover:bg-bg-elevated rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm text-text-primary line-clamp-1">{mangaTitle}</h1>
            <span className="text-xs text-text-muted truncate max-w-[200px]">{chapterTitle}</span>
          </div>
        </div>
        <div className="text-[10px] font-bold tracking-wider bg-bg-elevated text-text-primary px-2 py-1 rounded-md">
          {progress}%
        </div>
      </div>

      {/* FLOATING SCROLL BUTTONS */}
      <div className={`fixed right-4 bottom-24 z-40 flex flex-col gap-3 transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={scrollToTop}
          className="w-10 h-10 bg-bg-card border border-border shadow-lg rounded-full flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-bg-elevated transition-colors active:scale-95"
          aria-label="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 bg-bg-card border border-border shadow-lg rounded-full flex items-center justify-center text-text-muted hover:text-accent-red hover:bg-bg-elevated transition-colors active:scale-95"
          aria-label="Scroll to Bottom"
        >
          <ArrowDown size={20} />
        </button>
      </div>

      {/* BOTTOM DOCK */}
      <div className={`fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 transition-transform duration-300 ${showUI ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <div className="bg-bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-full px-6 py-3 flex items-center gap-6 sm:gap-8 min-w-[320px] justify-between backdrop-blur-md">
          {navigation?.prev ? (
            <Link href={`/read/${slug}/${navigation.prev}`} className="text-text-muted hover:text-text-primary transition active:scale-95">
              <ChevronLeft size={24} />
            </Link>
          ) : (
            <span className="text-text-muted opacity-50 cursor-not-allowed"><ChevronLeft size={24} /></span>
          )}

          <button
            onClick={() => toggleMenu('settings')}
            className={`transition active:scale-95 ${activeMenu === 'settings' ? 'text-accent-red' : 'text-text-muted hover:text-text-primary'}`}
          >
            <Settings size={22} />
          </button>

          <button
            onClick={toggleAutoScroll}
            className={`transition active:scale-95 ${isAutoScrolling ? 'text-accent-red' : 'text-text-muted hover:text-text-primary'}`}
          >
            {isAutoScrolling ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>

          <button
            onClick={() => toggleMenu('chapters')}
            className={`transition active:scale-95 ${activeMenu === 'chapters' ? 'text-accent-red' : 'text-text-muted hover:text-text-primary'}`}
          >
            <List size={24} />
          </button>

          <Link href={`/manga/${manga?.slug || slug}`} className="text-text-muted hover:text-accent-red transition active:scale-95">
            <Home size={22} />
          </Link>

          {navigation?.next ? (
            <Link href={`/read/${slug}/${navigation.next}`} className="text-text-muted hover:text-text-primary transition active:scale-95">
              <ChevronRight size={24} />
            </Link>
          ) : (
            <span className="text-text-muted opacity-50 cursor-not-allowed"><ChevronRight size={24} /></span>
          )}
        </div>
      </div>

      {/* SETTINGS MENU */}
      {activeMenu === 'settings' && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-bg-card border border-border rounded-2xl shadow-2xl z-40 p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <span className="text-sm font-bold text-text-primary">Pengaturan Reader</span>
            <button onClick={() => setActiveMenu(null)} className="text-text-muted hover:text-accent-red transition-colors"><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf || !isLoggedIn || (!isUnlimitedMember && downloadCount !== null && downloadCount >= downloadLimit)}
                className={`w-full flex items-center justify-between text-[11px] font-semibold px-3 py-2 rounded-lg border transition-colors mb-3 ${isDownloadingPdf || !isLoggedIn || (!isUnlimitedMember && downloadCount !== null && downloadCount >= downloadLimit)
                  ? 'text-text-muted border-border cursor-not-allowed bg-bg-elevated'
                  : 'text-text-primary border-border bg-transparent hover:border-accent-red hover:text-accent-red'
                  }`}
              >
                <span>
                  {isDownloadingPdf
                    ? 'MEMPROSES PDF...'
                    : !isLoggedIn
                      ? 'LOGIN UNTUK DOWNLOAD PDF'
                      : isUnlimitedMember
                        ? 'DOWNLOAD CHAPTER PDF (∞)'
                        : (!isUnlimitedMember && downloadCount !== null && downloadCount >= downloadLimit)
                          ? 'BATAS DOWNLOAD TERCAPAI'
                          : 'DOWNLOAD CHAPTER PDF'}
                </span>
                <Download size={14} />
              </button>

              {/* Info sisa download */}
              {!isLoggedIn && (
                <p className="text-[10px] text-yellow-400 mb-3">
                  Fitur download PDF hanya untuk member login.
                </p>
              )}
              {isLoggedIn && !isUnlimitedMember && (
                <div className="mb-3">
                  {/* Label + angka */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sisa Download Hari Ini</span>
                    {downloadCount !== null ? (
                      <span className={`text-[11px] font-bold ${downloadLimit - downloadCount <= 0
                        ? 'text-red-400'
                        : downloadLimit - downloadCount <= 2
                          ? 'text-yellow-400'
                          : 'text-green-400'
                        }`}>
                        {Math.max(0, downloadLimit - downloadCount)}/{downloadLimit}
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted">...</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  {downloadCount !== null && (
                    <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${downloadLimit - downloadCount <= 0
                          ? 'bg-red-500'
                          : downloadLimit - downloadCount <= 2
                            ? 'bg-yellow-400'
                            : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.max(0, Math.min(100, ((downloadLimit - downloadCount) / downloadLimit) * 100))}%` }}
                      />
                    </div>
                  )}
                  {/* Pesan habis */}
                  {downloadCount !== null && downloadCount >= downloadLimit && (
                    <p className="text-[10px] text-red-400 mt-1.5">
                      Limit harian tercapai. Reset setiap hari. <span className="text-accent-red font-semibold">Upgrade Premium</span> untuk akses tanpa batas.
                    </p>
                  )}
                </div>
              )}
              {isLoggedIn && isUnlimitedMember && (
                <p className="text-[10px] text-green-400 mb-3">
                  ✓ Download tidak terbatas (Premium)
                </p>
              )}

              <div className="flex justify-between text-xs text-text-muted mb-2 font-semibold">
                <span>LEBAR GAMBAR</span>
                <span>{fitToWidth ? 'FIT' : `${Math.round(imageWidth / 10)}%`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFitToWidth(!fitToWidth)}
                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${fitToWidth ? 'bg-accent-red border-accent-red text-white' : 'border-border text-text-muted hover:border-accent-red hover:text-accent-red'}`}
                >
                  FIT
                </button>
                <input
                  type="range" min="300" max="1200"
                  value={imageWidth} disabled={fitToWidth}
                  onChange={(e) => setImageWidth(Number(e.target.value))}
                  className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-2 font-semibold">
                <span>KECEPATAN AUTO-SCROLL</span>
                <span>{scrollSpeed}x</span>
              </div>
              <input
                type="range" min="1" max="10"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER LIST MENU */}
      {activeMenu === 'chapters' && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-bg-card border border-border rounded-2xl shadow-2xl z-40 flex flex-col max-h-[50vh]">
          <div className="p-4 border-b border-border flex justify-between items-center bg-bg-elevated rounded-t-2xl">
            <h3 className="font-bold text-sm text-text-primary">Chapters ({chapterList.length})</h3>
            <button onClick={() => setActiveMenu(null)} className="text-text-muted hover:text-accent-red transition-colors"><X size={18} /></button>
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
                      ? 'bg-accent-red text-white shadow-[0_0_10px_rgba(233,121,145,0.5)]'
                      : 'bg-bg-elevated text-text-muted hover:bg-bg-secondary hover:text-accent-red border border-transparent hover:border-accent-red'
                      }`}
                  >
                    {String(chNumber).length > 5 ? String(chNumber).slice(0, 5) : chNumber}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-5 text-center py-6 text-text-muted text-xs">
                Memuat daftar chapter...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
