import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse, getPaginationParams } from '@/lib/api-helpers';

async function isAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  
  const tokenUid = authHeader.split('Bearer ')[1];
  const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
  
  return ADMIN_UIDS.includes(tokenUid);
}

export async function GET(request) {
  try {
    await dbConnect();
    if (!(await isAdmin(request))) return errorResponse('Forbidden', 403);
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const { page, limit, skip } = getPaginationParams(searchParams);

    const matchQuery = {};
    if (q) {
      matchQuery.$or = [
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { googleId: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(matchQuery)
      .select('googleId email displayName photoURL isAdmin isPremium premiumUntil downloadCount dailyDownloads')
      .sort({ 'dailyDownloads.count': -1, downloadCount: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(matchQuery);

    return successResponse(users, {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}
