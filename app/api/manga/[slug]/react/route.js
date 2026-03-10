import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import { errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(request, { params }) {
  try {
    const slug = params.slug;
    const body = await request.json();
    const { type, action } = body; // action: 'add' or 'remove'

    const validTypes = ['like', 'funny', 'nice', 'sad', 'angry'];
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid reaction type', 400);
    }

    const increment = action === 'remove' ? -1 : 1;

    await dbConnect();
    
    const manga = await Manga.findOneAndUpdate(
      { slug },
      { $inc: { [`reactions.${type}`]: increment } },
      { returnDocument: 'after' } // Mongoose returns the updated document
    );

    if (!manga) {
      return errorResponse('Manga not found', 404);
    }

    return successResponse(
      manga.reactions || { like: 0, funny: 0, nice: 0, sad: 0, angry: 0 },
      'Reaction updated completely'
    );
  } catch (error) {
    console.error('Error updating reaction:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
