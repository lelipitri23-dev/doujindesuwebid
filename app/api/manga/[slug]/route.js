import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import Chapter from '@/lib/models/Chapter';
import { successResponse, errorResponse, attachChapterCounts } from '@/lib/api-helpers';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { slug } = params;

    const manga = await Manga.findOneAndUpdate(
      { slug: params.slug },
      { $inc: { views: 1 } },
      { returnDocument: 'after', timestamps: false }
    ).lean();

    if (!manga) return errorResponse('Manga not found', 404);

    const chaptersPromise = Chapter.find({ manga_id: manga._id })
      .select('title slug chapter_index createdAt')
      .sort({ chapter_index: -1 })
      .collation({ locale: 'en_US', numericOrdering: true })
      .lean();

    const recommendationsPromise = Manga.aggregate([
      { $match: { _id: { $ne: manga._id } } },
      { $sample: { size: 6 } },
      { $project: { title: 1, slug: 1, thumb: 1, metadata: 1, views: 1 } },
    ]);

    const [chapters, rawRecommendations] = await Promise.all([
      chaptersPromise,
      recommendationsPromise,
    ]);

    const recommendations = await attachChapterCounts(rawRecommendations);

    manga.chapter_count = chapters.length;

    return successResponse({
      info: manga,
      chapters,
      recommendations,
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}
