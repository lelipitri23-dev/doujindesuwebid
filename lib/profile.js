/**
 * lib/profile.js
 *
 * Profil publik user — semua data dari BACKEND, bukan Firebase.
 * Backend endpoints:
 *   GET   /users/:googleId/public-profile  → profil + library + stats
 *   PATCH /users/:googleId/bio             → update bio
 *   POST  /users/sync                      → sinkronisasi data user (dipanggil saat login)
 */

function proxyBase() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/proxy`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${proxyBase()}${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data;
}

/**
 * Sync data user ke backend setiap kali login.
 * Menggantikan updatePublicProfile (Firebase).
 * Dipanggil dari AuthContext.
 */
export async function updatePublicProfile(googleId, userData = {}) {
  if (!googleId) return;
  try {
    await apiFetch('/users/sync', {
      method: 'POST',
      body: JSON.stringify({
        googleId,
        email:       userData.email       || '',
        displayName: userData.displayName || '',
        photoURL:    userData.photoURL    || '',
      }),
    });
  } catch (err) {
    // Jangan crash app jika sync gagal
    console.warn('[Profile] sync error:', err.message);
  }
}

/**
 * Ambil profil publik user.
 * Return: { googleId, displayName, photoURL, bio, library, stats }
 */
export async function getPublicProfile(userId) {
  if (!userId) return null;
  try {
    return await apiFetch(`/users/${userId}/public-profile`);
  } catch (err) {
    console.error('[Profile] getPublicProfile error:', err.message);
    return null;
  }
}

/**
 * Update bio user (maks 100 karakter).
 */
export async function updateBio(userId, bio) {
  if (!userId) return;
  await apiFetch(`/users/${userId}/bio`, {
    method: 'PATCH',
    body: JSON.stringify({ bio }),
  });
}

/**
 * @deprecated Tidak lagi diperlukan — backend auto-hitung stats dari library.
 * Dibiarkan ada agar tidak error jika ada import lain.
 */
export async function updateProfileStats() {}
