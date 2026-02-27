/**
 * API Proxy Route — Menghindari CORS error
 * Semua method (GET, POST, PUT, PATCH, DELETE) didukung
 */

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

async function proxyRequest(request, { params }) {
  const path = params.path?.join('/') || '';
  const { search } = new URL(request.url);
  const targetUrl = `${BACKEND}/${path}${search}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'DoujinDesu-Frontend/1.0',
    };
    if (request.headers.get('cookie')) {
      headers['cookie'] = request.headers.get('cookie');
    }

    // Forward body untuk metode yang membutuhkannya
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = await request.text();
    }

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const data = await res.json();

    return Response.json(data, {
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': request.method === 'GET'
          ? 'public, max-age=60, stale-while-revalidate=300'
          : 'no-store',
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export const GET    = proxyRequest;
export const POST   = proxyRequest;
export const PUT    = proxyRequest;
export const PATCH  = proxyRequest;
export const DELETE = proxyRequest;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
