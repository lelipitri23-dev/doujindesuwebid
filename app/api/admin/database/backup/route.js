import dbConnect from '@/lib/mongodb';
import Manga from '@/lib/models/Manga';
import Chapter from '@/lib/models/Chapter';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';
import zlib from 'zlib';

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
    if (!(await isAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'gz'; // default to gz

    // Ambil semua data
    const mangas = await Manga.find({}).lean();
    const chapters = await Chapter.find({}).lean();
    const users = await User.find({}).lean();

    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        mangas,
        chapters,
        users
      }
    };

    // Convert to JSON String
    const jsonString = JSON.stringify(backupData, null, 2);

    if (format === 'json') {
      // Return raw JSON
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="doujindesu_backup_${new Date().getTime()}.json"`
        }
      });
    }

    // Default: Compress using Zlib (GZIP)
    const gzippedData = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'));

    // Return as downloadable GZIP JSON
    return new NextResponse(gzippedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="doujindesu_backup_${new Date().getTime()}.json.gz"`
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
