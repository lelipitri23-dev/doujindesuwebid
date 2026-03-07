import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    let token = null;

    try {
      const body = await request.json();
      token = body?.token;
    } catch (e) {
      console.error('Invalid JSON body');
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is missing or invalid JSON' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not defined in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verifyUrl, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.success && data.score >= 0.5) {
      // Score 0.5 or higher is generally considered human
      return NextResponse.json({ success: true, score: data.score });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Verifikasi bot gagal. Silakan coba lagi.', 
          score: data.score,
          errors: data['error-codes']
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memverifikasi Captcha' },
      { status: 500 }
    );
  }
}
