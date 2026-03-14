import { errorResponse } from '@/lib/api-helpers';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

const TRAKTEER_API_KEY = process.env.TRAKTEER_API_KEY;

// GET /api/admin/trakteer
// Returns: Trakteer support history + premium users from DB
export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }
    const googleId = authHeader.split('Bearer ')[1];

    await dbConnect();
    const admin = await User.findOne({ googleId, isAdmin: true }).lean();
    if (!admin) return errorResponse('Forbidden', 403);

    // Fetch Trakteer support history (page 1 + 2 to get more)
    const fetchPage = async (page = 1) => {
      const res = await fetch(
        `https://api.trakteer.id/v1/public/supports?page=${page}&include=payment_method,order_id`,
        {
          headers: {
            key: TRAKTEER_API_KEY,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );
      if (!res.ok) return { data: [], meta: null };
      const json = await res.json();
      return json?.result || { data: [], meta: null };
    };

    const p1 = await fetchPage(1);
    const p2 = p1?.meta?.pagination?.total_pages > 1 ? await fetchPage(2) : { data: [] };
    const trakteerSupports = [...(p1.data || []), ...(p2.data || [])];

    // Fetch balance
    const balRes = await fetch('https://api.trakteer.id/v1/public/current-balance', {
      headers: {
        key: TRAKTEER_API_KEY,
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const balJson = await balRes.json();
    const balance = balJson?.result || '0';

    // Fetch premium users from DB
    const premiumUsers = await User.find({ isPremium: true })
      .select('displayName email googleId isPremium premiumUntil createdAt photoURL pendingPremiumOrders')
      .sort({ premiumUntil: -1 })
      .lean();

    return Response.json({
      success: true,
      data: {
        balance,
        trakteerSupports,
        totalSupports: p1?.meta?.pagination?.total || trakteerSupports.length,
        premiumUsers: premiumUsers.map((u) => ({
          googleId: u.googleId,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          isPremium: u.isPremium,
          premiumUntil: u.premiumUntil,
          pendingOrders: (u.pendingPremiumOrders || []).length,
        })),
      },
    });
  } catch (err) {
    console.error('[admin/trakteer]', err);
    return errorResponse(err.message, 500);
  }
}
