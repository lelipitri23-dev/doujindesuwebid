import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/api-helpers';

// GET: List premium users for display on homepage
export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const users = await User.find({
      $or: [
        { isPremium: true },
        { premiumUntil: { $gt: now } },
      ],
    })
      .select('googleId displayName photoURL premiumUntil isPremium isAdmin')
      .sort({ premiumUntil: -1, createdAt: -1 })
      .limit(20)
      .lean();

    const data = users.map(u => ({
      googleId: u.googleId,
      displayName: u.displayName || 'Pengguna',
      photoURL: u.photoURL || '',
      premiumUntil: u.premiumUntil || null,
      isAdmin: !!u.isAdmin,
    }));

    return successResponse(data);
  } catch (err) {
    return errorResponse(err.message);
  }
}
