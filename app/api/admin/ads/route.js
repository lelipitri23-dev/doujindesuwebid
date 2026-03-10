import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ADS_FILE_PATH = path.join(process.cwd(), 'lib', 'ads.js');

async function checkAdmin(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  
  const tokenUid = authHeader.split('Bearer ')[1];
  const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
  
  if (!tokenUid || !ADMIN_UIDS.includes(tokenUid)) {
    return false;
  }
  return true;
}

export async function GET(req) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const content = await fs.readFile(ADS_FILE_PATH, 'utf-8');
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!(await checkAdmin(req))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid content' }, { status: 400 });
    }

    await fs.writeFile(ADS_FILE_PATH, content, 'utf-8');
    return NextResponse.json({ success: true, message: 'Konfigurasi iklan berhasil disimpan!' });
  } catch (error) {
    console.error('Error saving ads.js:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
