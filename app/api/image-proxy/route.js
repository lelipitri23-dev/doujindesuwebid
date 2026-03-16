const ALLOWED_HOSTS = new Set([
  'desu.photos',
  'images.manhwaland.email',
  'img.manhwaland.email',
  'cdn-images.doujindesu.fun',
]);

function normalizeTargetUrl(rawUrl) {
  if (!rawUrl) return null;

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

  return url;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const normalized = normalizeTargetUrl(rawUrl);

  if (!normalized) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let target;
  try {
    target = new URL(normalized);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return new Response('Unsupported protocol', { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new Response('Host not allowed', { status: 403 });
  }

  try {
    let upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        Referer: 'https://desu.photos/',
        Origin: 'https://desu.photos',
      },
      cache: 'no-store',
    });

    // Jika gagal dengan referer desu.photos, coba fallback dengan referer manhwaland
    if (!upstream.ok) {
      upstream = await fetch(target.toString(), {
        method: 'GET',
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
          Referer: 'https://img.manhwaland.email/',
          Origin: 'https://img.manhwaland.email',
        },
        cache: 'no-store',
      });
    }

    if (!upstream.ok) {
      return new Response(`Upstream returned ${upstream.status}`, {
        status: upstream.status,
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/webp',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return new Response(`Proxy error: ${error?.message || 'Unknown error'}`, {
      status: 502,
    });
  }
}
