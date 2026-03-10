import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import { successResponse, errorResponse, getPaginationParams, attachChapterCounts } from '@/lib/api-helpers';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { type, value } = params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    let query = {};

    if (type === 'genre') {
      const cleanValue = value.replace(/-/g, '[\\s\\-]');
      query = { tags: { $regex: new RegExp(cleanValue, 'i') } };
    } else if (type === 'status') {
      query = { 'metadata.status': { $regex: `^${value}$`, $options: 'i' } };
    } else if (type === 'type') {
      query = { 'metadata.type': { $regex: `^${value}$`, $options: 'i' } };
    } else {
      return errorResponse('Invalid filter type. Use: genre, status, or type.', 400);
    }

    const [total, mangasRaw] = await Promise.all([
      Manga.countDocuments(query),
      Manga.find(query)
        .sort({ updatedAt: -1 })
        .select('title slug thumb metadata updatedAt')
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const mangas = await attachChapterCounts(mangasRaw);

    return successResponse(mangas, {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      filter: { type, value },
      perPage: limit,
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}
