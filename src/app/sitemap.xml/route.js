import { SITE_CONFIG } from '@/lib/config';

// Fungsi bantu untuk membersihkan karakter aneh agar XML valid
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

export async function GET() {
  const baseUrl = SITE_CONFIG.baseUrl;
  let mangas = [];

  // 1. Fetch Data
  try {
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/manga?limit=1000`, {
      cache: 'no-store',
    });
    const json = await res.json();
    mangas = json.data || [];
  } catch (e) {
    console.error("Gagal generate sitemap:", e);
  }

  // 2. Buat Header XML
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // 3. Buat URL Statis (Home & List)
  const staticUrls = [
    { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/list`, priority: '0.9', changefreq: 'daily' },
  ]
  .map((item) => {
    return `
  <url>
    <loc>${item.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
  })
  .join('');

  // 4. Buat URL Manga Dinamis (Dengan Gambar Lengkap)
  const dynamicUrls = mangas
    .map((manga) => {
      const loc = `${baseUrl}/manga/${escapeXml(manga.slug)}`;
      const lastMod = new Date(manga.updatedAt || new Date()).toISOString();
      
      // Bagian Gambar
      let imageTag = '';
      if (manga.thumb) {
        imageTag = `
    <image:image>
      <image:loc>${escapeXml(manga.thumb)}</image:loc>
      <image:title>${escapeXml(manga.title)}</image:title>
      <image:caption>Baca komik ${escapeXml(manga.title)} Bahasa Indonesia</image:caption>
    </image:image>`;
      }

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
    })
    .join('');

  // 5. Gabungkan Semua
  const sitemap = `${xmlHeader}${staticUrls}${dynamicUrls}
</urlset>`;

  // 6. Return Response XML
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}