import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

export async function GET(request) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ success: false, message: 'TELEGRAM_BOT_TOKEN is not defined in .env' }, { status: 400 });
  }

  // Telegram API requires an HTTPS URL
  let httpsUrl = NEXT_PUBLIC_SITE_URL;
  if (!httpsUrl.startsWith('https://')) {
    return NextResponse.json({ success: false, message: 'Webhook URL must be HTTPS! (use ngrok for local testing)' }, { status: 400 });
  }

  // Endpoints to Next.js API route
  const WEBHOOK_URL = `${httpsUrl}/api/telegram/webhook`;
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;

  try {
    const res = await fetch(TELEGRAM_API);
    const data = await res.json();
    
    if (data.ok) {
      return NextResponse.json({ success: true, message: `Webhook set successfully to ${WEBHOOK_URL}`, data });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to set webhook', data }, { status: 400 });
    }
  } catch (error) {
    console.error('Set Webhook Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
