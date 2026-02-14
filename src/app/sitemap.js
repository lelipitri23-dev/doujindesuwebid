import { SITE_CONFIG } from '@/lib/config';

export default async function sitemap() {
  const baseUrl = SITE_CONFIG.baseUrl;

  // 1. Ambil data manga dari Backend
  // NOTE: Kita naikkan limit ke 1000 atau lebih agar Google bisa melihat semua koleksi.
  // Jika datanya ribuan, sebaiknya nanti buat endpoint API khusus yang hanya return slug (ringan).
  let mangas = [];
  try {
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga?limit=1000`, {
        cache: 'no-store'
    });
    const json = await res.json();
    mangas = json.data || [];
  } catch (e) {
    console.error("Gagal generate sitemap manga:", e);
  }

  // 2. Buat URL Dinamis (Halaman Detail Manga)
  const mangaUrls = mangas.map((manga) => ({
    url: `${baseUrl}/manga/${manga.slug}`,
    lastModified: new Date(manga.updatedAt || new Date()),
    priority: 0.8, // Prioritas tinggi untuk konten utama
  }));

  // 3. URL Statis Utama
  // Hapus '/bookmarks' (User specific/NoIndex)
  // Hapus '/search' (Search result pages tidak boleh di sitemap)
  // Hapus '/type/...' (Karena sekarang pakai query param di /list)
  const staticRoutes = [
    '',        // Homepage (http://localhost:3000)
    '/list',   // Halaman List (http://localhost:3000/list)
  ];
  
  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    priority: route === '' ? 1.0 : 0.9,
  }));

  return [...staticUrls, ...mangaUrls];
}