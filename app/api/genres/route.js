import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    await dbConnect();

    const genres = await Manga.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $ne: '' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const formattedGenres = genres.map(g => ({ name: g._id, count: g.count }));

    return successResponse(formattedGenres);
  } catch (err) {
    return errorResponse(err.message);
  }
}
