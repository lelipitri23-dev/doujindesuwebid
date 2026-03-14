import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { errorResponse } from '@/lib/api-helpers';

// Paket premium yang tersedia
const PREMIUM_PACKAGES = {
  '7days': { days: 7, amount: 3000, label: '7 Hari' },
};

// POST /api/payments/create-order
export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }
    const googleId = authHeader.split('Bearer ')[1];

    const body = await request.json().catch(() => ({}));
    const packageKey = body.package || '7days';
    const pkg = PREMIUM_PACKAGES[packageKey];
    if (!pkg) return errorResponse('Paket tidak valid', 400);

    await dbConnect();
    const user = await User.findOne({ googleId });
    if (!user) return errorResponse('User not found', 404);

    // Buat orderId unik: PRE-<8 char googleId>-<timestamp>
    const timestamp = Date.now();
    const shortId = googleId.slice(0, 8).toUpperCase();
    const orderId = `PRE-${shortId}-${timestamp}`;

    // Simpan pending order ke user
    if (!user.pendingPremiumOrders) user.pendingPremiumOrders = [];
    user.pendingPremiumOrders.push({
      orderId,
      days: pkg.days,
      amount: pkg.amount,
      createdAt: new Date(),
    });
    await user.save();

    const trakteerPageUrl = process.env.TRAKTEER_PAGE_URL || 'https://trakteer.id/kamisekai/tip';
    const trakteerUrl = `${trakteerPageUrl}?quantity=1&message=${encodeURIComponent(orderId)}`;

    return Response.json({
      success: true,
      data: {
        orderId,
        trakteerUrl,
        amount: pkg.amount,
        days: pkg.days,
        label: pkg.label,
        message: `Order berhasil dibuat. Silakan bayar Rp${pkg.amount.toLocaleString('id-ID')} via Trakteer.`,
      },
    });
  } catch (err) {
    console.error('[create-order] error:', err);
    return errorResponse(err.message, 500);
  }
}
