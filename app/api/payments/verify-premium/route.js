import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { errorResponse } from '@/lib/api-helpers';

const TRAKTEER_API_KEY = process.env.TRAKTEER_API_KEY;
const TRAKTEER_SUPPORTS_URL = 'https://api.trakteer.id/v1/public/supports';

// Rate limiter — max 1 request per 30 detik per googleId
const RATE_LIMIT_MS = 30 * 1000;
const rateLimitMap = new Map(); // googleId → lastAttemptTimestamp

// POST /api/payments/verify-premium
export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }
    const googleId = authHeader.split('Bearer ')[1];

    // ─── Rate Limit ──────────────────────────────────────────
    const tsNow = Date.now();
    const lastAttempt = rateLimitMap.get(googleId) || 0;
    const elapsed = tsNow - lastAttempt;
    if (elapsed < RATE_LIMIT_MS) {
      const waitSec = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      return Response.json({
        success: false,
        message: `Terlalu banyak percobaan. Coba lagi dalam ${waitSec} detik.`,
      }, { status: 429 });
    }
    rateLimitMap.set(googleId, tsNow);
    // Bersihkan entry lama setelah 2x TTL untuk hemat memori
    setTimeout(() => rateLimitMap.delete(googleId), RATE_LIMIT_MS * 2);
    // ─────────────────────────────────────────────────────────

    const body = await request.json().catch(() => ({}));
    const { orderId } = body;
    if (!orderId) return errorResponse('orderId diperlukan', 400);

    await dbConnect();
    const user = await User.findOne({ googleId });
    if (!user) return errorResponse('User not found', 404);

    // Cek apakah orderId ada di pendingPremiumOrders
    const pendingIndex = (user.pendingPremiumOrders || []).findIndex(
      (o) => o.orderId === orderId
    );
    if (pendingIndex === -1) {
      return errorResponse('Order tidak ditemukan. Pastikan orderId sudah benar.', 404);
    }

    const pendingOrder = user.pendingPremiumOrders[pendingIndex];

    // Fetch support history dari Trakteer
    const trakteerRes = await fetch(
      `${TRAKTEER_SUPPORTS_URL}?include=payment_method,order_id`,
      {
        method: 'GET',
        headers: {
          key: TRAKTEER_API_KEY,
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    if (!trakteerRes.ok) {
      return errorResponse('Gagal menghubungi Trakteer API. Coba lagi nanti.', 502);
    }

    const trakteerData = await trakteerRes.json();
    const supports = trakteerData?.result?.data || [];

    // Cari support yang message-nya mengandung orderId
    // Note: Trakteer API tidak mengembalikan field `status` per-item pada GET /supports
    // Item yang masuk ke response sudah merupakan pembayaran yang berhasil
    const matchedSupport = supports.find(
      (s) =>
        s.support_message?.includes(orderId) || s.order_id === orderId
    );

    if (!matchedSupport) {
      return Response.json({
        success: false,
        message:
          'Pembayaran belum ditemukan di Trakteer. Pastikan kamu sudah menyelesaikan pembayaran dan menyertakan kode order di pesan. Coba lagi dalam beberapa menit.',
      });
    }

    // Verifikasi jumlah bayar (toleransi: amount >= pendingOrder.amount)
    if (matchedSupport.amount < pendingOrder.amount) {
      return Response.json({
        success: false,
        message: `Jumlah pembayaran (Rp${matchedSupport.amount.toLocaleString(
          'id-ID'
        )}) tidak sesuai. Dibutuhkan minimal Rp${pendingOrder.amount.toLocaleString('id-ID')}.`,
      });
    }

    // Aktifkan premium
    const now = new Date();
    const daysMs = pendingOrder.days * 24 * 60 * 60 * 1000;

    let newPremiumUntil;
    if (user.isPremium && user.premiumUntil && user.premiumUntil > now) {
      // Extend existing premium
      newPremiumUntil = new Date(user.premiumUntil.getTime() + daysMs);
    } else {
      newPremiumUntil = new Date(now.getTime() + daysMs);
    }

    if (!user.isPremium) user.premiumAt = now;
    user.isPremium = true;
    user.premiumUntil = newPremiumUntil;

    // Hapus dari pending orders
    user.pendingPremiumOrders.splice(pendingIndex, 1);

    // Kirim notifikasi ke user
    if (!user.notifications) user.notifications = [];
    user.notifications.push({
      title: '🎉 Premium Berhasil Diaktifkan!',
      message: `Pembayaran Rp${pendingOrder.amount.toLocaleString(
        'id-ID'
      )} berhasil dikonfirmasi. Premium kamu aktif hingga ${newPremiumUntil.toLocaleDateString(
        'id-ID',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )}.`,
      isRead: false,
      createdAt: new Date(),
    });

    await user.save();

    return Response.json({
      success: true,
      message: `Pembayaran berhasil diverifikasi! 🚀 Premium aktif selama ${pendingOrder.days} hari.`,
      data: {
        premiumUntil: user.premiumUntil,
        days: pendingOrder.days,
      },
    });
  } catch (err) {
    console.error('[verify-premium] error:', err);
    return errorResponse(err.message, 500);
  }
}
