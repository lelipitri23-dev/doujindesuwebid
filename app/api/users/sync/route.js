import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request) {
  try {
    await dbConnect();

    const { googleId, email, displayName, photoURL } = await request.json();
    if (!googleId) return errorResponse('googleId is required', 400);

    const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
    const isUserAdmin = ADMIN_UIDS.includes(googleId);

    let user = await User.findOne({ googleId });
    const today = new Date().toISOString().split('T')[0];

    if (!user) {
      user = new User({
        googleId,
        email,
        displayName,
        photoURL: photoURL || '',
        isAdmin: isUserAdmin,
        isPremium: isUserAdmin,
        dailyDownloads: { date: today, count: 0 },
      });
    } else {
      user.isAdmin = isUserAdmin;
      if (displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;

      if (isUserAdmin) {
        user.isPremium = true;
      } else if (user.isPremium && user.premiumUntil) {
        if (new Date() > user.premiumUntil) {
          user.isPremium = false;
          user.premiumUntil = null;
        }
      }

      if (!user.dailyDownloads) {
        user.dailyDownloads = { date: today, count: 0 };
      } else if (user.dailyDownloads.date !== today) {
        user.dailyDownloads.date = today;
        user.dailyDownloads.count = 0;
      }
    }

    await user.save();
    return successResponse(user);
  } catch (err) {
    return errorResponse(err.message);
  }
}
