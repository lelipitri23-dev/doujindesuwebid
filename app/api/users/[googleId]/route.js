import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { googleId } = params;
    const user = await User.findOne({ googleId }).lean();
    if (!user) return errorResponse('User not found', 404);

    return successResponse(user);
  } catch (err) {
    return errorResponse(err.message);
  }
}
