import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import { successResponse, errorResponse, getPaginationParams, attachChapterInfo } from '@/lib/api-helpers';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const order = searchParams.get('order');

    let query = {};

    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }
    if (status && status !== 'all') {
      query['metadata.status'] = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    if (type && type !== 'all') {
      query['metadata.type'] = { $regex: new RegExp(`^${type}$`, 'i') };
    }
    if (genre && genre !== 'all') {
      const cleanGenre = genre.replace(/-/g, '[\\s\\-]');
      query.tags = { $regex: new RegExp(cleanGenre, 'i') };
    }

    let sortOption = { updatedAt: -1 };
    switch (order) {
      case 'oldest': sortOption = { updatedAt: 1 }; break;
      case 'popular': sortOption = { views: -1 }; break;
      case 'az': sortOption = { title: 1 }; break;
      case 'za': sortOption = { title: -1 }; break;
      default: sortOption = { updatedAt: -1 };
    }

    const total = await Manga.countDocuments(query);

    const mangasRaw = await Manga.find(query)
      .select('title slug thumb metadata views rating status type tags updatedAt')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const mangas = await attachChapterInfo(mangasRaw);

    return successResponse(mangas, {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}
