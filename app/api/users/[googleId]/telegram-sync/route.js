import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/api-helpers';

// PUT: Menghasilkan (generate) kode unik 6 digit untuk sinkronisasi Telegram
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { googleId } = params;

    const user = await User.findOne({ googleId });
    if (!user) return errorResponse('User not found', 404);

    // Generate kode unik numerik 6 digit
    const syncCode = Math.floor(100000 + Math.random() * 900000).toString();

    const updatedUser = await User.findOneAndUpdate(
      { googleId },
      { $set: { telegramSyncCode: syncCode } },
      { returnDocument: 'after' }
    ).select('-notifications -history -library'); // Kecualikan field berat

    return successResponse({
      telegramSyncCode: updatedUser.telegramSyncCode,
      telegramId: updatedUser.telegramId
    });
  } catch (err) {
    console.error('Error generating sync code:', err);
    return errorResponse(err.message);
  }
}
