import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import { successResponse, errorResponse, getPaginationParams, attachChapterCounts } from '@/lib/api-helpers';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const totalMangaPromise = Manga.countDocuments();

    const recentsPromise = Manga.find()
      .select('title slug thumb metadata createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const trendingPromise = Manga.find()
      .select('title slug thumb views metadata')
      .sort({ views: -1 })
      .limit(10)
      .lean();

    const manhwasPromise = Manga.find({ 'metadata.type': { $regex: 'manhwa', $options: 'i' } })
      .select('title slug thumb metadata updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const mangasPromise = Manga.find({ 'metadata.type': { $regex: 'manga', $options: 'i' } })
      .select('title slug thumb metadata updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const doujinshisPromise = Manga.find({ 'metadata.type': { $regex: 'doujinshi', $options: 'i' } })
      .select('title slug thumb metadata updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const [totalManga, recentsRaw, trendingRaw, manhwasRaw, mangasRaw, doujinshisRaw] = await Promise.all([
      totalMangaPromise,
      recentsPromise,
      trendingPromise,
      manhwasPromise,
      mangasPromise,
      doujinshisPromise,
    ]);

    const [recents, trending, manhwas, mangas, doujinshis] = await Promise.all([
      attachChapterCounts(recentsRaw),
      attachChapterCounts(trendingRaw),
      attachChapterCounts(manhwasRaw),
      attachChapterCounts(mangasRaw),
      attachChapterCounts(doujinshisRaw),
    ]);

    return successResponse(
      { recents, trending, manhwas, mangas, doujinshis },
      {
        currentPage: page,
        totalPages: Math.ceil(totalManga / limit),
        totalItems: totalManga,
        perPage: limit,
      }
    );
  } catch (err) {
    return errorResponse(err.message);
  }
}
