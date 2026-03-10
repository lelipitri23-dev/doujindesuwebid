import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Manga from '@/lib/models/Manga';
import Chapter from '@/lib/models/Chapter';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import axios from 'axios';

// Konfigurasi Token Telegram
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ===== Helper Functions =====
const sendMessage = async (chatId, text, parseMode = 'Markdown') => {
  if (!BOT_TOKEN) return;
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    });
  } catch (error) {
    console.error('Failed to send telegram message:', error?.response?.data || error.message);
  }
};

const sendDocument = async (chatId, buffer, filename, caption = '') => {
  if (!BOT_TOKEN) return;
  try {
    const formData = new FormData();
    // Wrap Buffer using Blob/File as FormData expects Blob in modern environments
    const blob = new Blob([buffer], { type: 'application/pdf' });
    formData.append('chat_id', chatId);
    formData.append('document', blob, filename);
    if (caption) formData.append('caption', caption);

    await fetch(`${TELEGRAM_API}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Failed to send document:', error.message);
  }
};

const downloadImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data, 'binary');
  } catch (err) {
    console.error('Failed to download image:', url, err.message);
    return null;
  }
};

// =============================
// MAIN WEBHOOK EXPORT (POST)
// =============================
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Pastikan ini adalah message teks dari user
    if (!body || !body.message || !body.message.text) {
      return NextResponse.json({ received: true }); 
    }

    const msg = body.message;
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // 1) Cek User Database
    const user = await User.findOne({ telegramId: chatId.toString() });

    // 2) Routing Comands
    if (text.startsWith('/start')) {
      let response = `👋 Selamat datang di Doujindesu Bot!\n\n`;
      if (!user) {
        response += `❌ Akun Anda belum terhubung.\n\nSilakan buka website kami, masuk ke Profil, klik 'Hubungkan Telegram' untuk mendapatkan kode Anda.\nLalu balas di sini dengan perintah:\n\`/login <KODE>\`\n\nContoh: \`/login 123456\``;
      } else {
        response += `✅ Halo ${user.displayName || 'Pengguna'}!\nAkun Anda sudah terhubung.\n\nPerintah yang tersedia:\n/cari <Judul> - Mencari komik\n/manga <slug> - Melihat daftar chapter\n/download <ID> - Unduh chapter PDF`;
      }
      await sendMessage(chatId, response);
      return NextResponse.json({ success: true });
    }

    // Command: /login <code>
    if (text.startsWith('/login')) {
      const parts = text.split(' ');
      const code = parts[1];

      if (!code) {
        await sendMessage(chatId, `⚠️ Format salah. Gunakan: \`/login <6-digit-kode>\``);
        return NextResponse.json({ success: true });
      }

      if (user) {
        await sendMessage(chatId, `✅ Akun Anda sudah terhubung sebagai ${user.displayName || 'Pengguna'}.`);
        return NextResponse.json({ success: true });
      }

      const userToLogin = await User.findOne({ telegramSyncCode: code });
      if (!userToLogin) {
        await sendMessage(chatId, `❌ Kode tidak valid atau kadaluarsa. Silakan generate ulang kode di profil web Anda.`);
        return NextResponse.json({ success: true });
      }

      userToLogin.telegramId = chatId.toString();
      userToLogin.telegramSyncCode = null;
      await userToLogin.save();

      await sendMessage(chatId, `🎉 Sukses! Akun Telegram Anda telah dihubungkan dengan akun web *${userToLogin.displayName || 'Pengguna'}*.\n\nSekarang Anda bisa memakai perintah:\n/cari <Judul>`);
      return NextResponse.json({ success: true });
    }

    // PASTIKAN USER SUDAH LOGIN UNTUK COMMAND SELANJUTNYA
    if (!user) {
      await sendMessage(chatId, `❌ Silakan /login terlebih dahulu.`);
      return NextResponse.json({ success: true });
    }

    // Command: /cari <Judul>
    if (text.startsWith('/cari')) {
      const query = text.substring(5).trim();

      if (!query) {
        await sendMessage(chatId, `⚠️ Format salah. Gunakan: \`/cari <Judul>\`\nContoh: \`/cari One Piece\``);
        return NextResponse.json({ success: true });
      }

      await sendMessage(chatId, `⏳ Mencari _${query}_...`);

      const mangas = await Manga.find({ title: { $regex: query, $options: 'i' } }).limit(5).lean();

      if (mangas.length === 0) {
        await sendMessage(chatId, `❌ Manga dengan judul "${query}" tidak ditemukan.`);
        return NextResponse.json({ success: true });
      }

      let response = `📚 *Hasil Pencarian:*\n\n`;
      mangas.forEach(m => {
        response += `📖 *${m.title}*\n`;
        response += `Slug: \`${m.slug}\`\n`;
        response += `Tipe: ${m.metadata?.type || 'Unknown'}\n`;
        response += `Buka Chapter: /manga ${m.slug}\n\n`;
      });

      await sendMessage(chatId, response);
      return NextResponse.json({ success: true });
    }

    // Command: /manga <slug>
    if (text.startsWith('/manga')) {
      const parts = text.split(' ');
      const slug = parts[1];

      if (!slug) {
        await sendMessage(chatId, `⚠️ Format salah. Gunakan: \`/manga <slug>\``);
        return NextResponse.json({ success: true });
      }

      const manga = await Manga.findOne({ slug }).lean();
      if (!manga) {
        await sendMessage(chatId, `❌ Manga tidak ditemukan.`);
        return NextResponse.json({ success: true });
      }

      const chapters = await Chapter.find({ manga_id: manga._id }).sort({ chapter_number: -1 }).limit(20).lean();

      if (chapters.length === 0) {
        await sendMessage(chatId, `⚠️ Manga *${manga.title}* belum punya chapter.`);
        return NextResponse.json({ success: true });
      }

      let response = `📖 *${manga.title}*\n\nDaftar 20 Chapter Terakhir:\n\n`;
      chapters.forEach(ch => {
        response += `🔹 Ch ${ch.chapter_number} - ${ch.title || 'Untitled'}\n👉 Unduh: /download ${ch._id}\n\n`;
      });

      await sendMessage(chatId, response);
      return NextResponse.json({ success: true });
    }

    // Command: /download <id> 
    // WARNING: Vercel Hobby serverless timeout is 10s-15s max. Process carefully.
    if (text.startsWith('/download')) {
      const parts = text.split(' ');
      const chapterId = parts[1];

      if (!chapterId) {
        await sendMessage(chatId, `⚠️ Format salah. Gunakan: \`/download <ID_CHAPTER>\``);
        return NextResponse.json({ success: true });
      }

      const MAX_LIMIT = 6;
      if (!user.isAdmin && !user.isPremium) {
        const today = new Date().toISOString().split('T')[0];
        if (user.dailyDownloads?.date !== today) {
          user.dailyDownloads = { date: today, count: 0 };
        }
        
        if (user.dailyDownloads.count >= MAX_LIMIT) {
          await sendMessage(chatId, `⛔ Batas unduhan harian (${MAX_LIMIT}) Anda telah tercapai.\n\nSilakan tunggu besok atau upgrade ke Premium di website!`);
          return NextResponse.json({ success: true });
        }
      }

      const chapter = await Chapter.findById(chapterId).lean();
      if (!chapter) {
        await sendMessage(chatId, `❌ Chapter tidak ditemukan.`);
        return NextResponse.json({ success: true });
      }

      const manga = await Manga.findById(chapter.manga_id).lean();
      const fileName = `${manga.title} - Chapter ${chapter.chapter_number}.pdf`;

      if (!chapter.images || chapter.images.length === 0) {
        await sendMessage(chatId, `⚠️ Chapter ini tidak memiliki gambar.`);
        return NextResponse.json({ success: true });
      }

      await sendMessage(chatId, `⏳ Sedang memproses PDF via Serverless...\nMohon tunggu.`);

      // WE WILL RETURN HTTP 200 FIRST TO TELEGRAM, SO IT DOES NOT RETRY AND CAUSE TIMEOUT SPAM
      // Then process asynchronously (Vercel allows brief post-response execution in edge/node)
      
      const compilePdf = async () => {
         try {
            const doc = new PDFDocument({ autoFirstPage: false });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            
            let successCount = 0;
            // Hanya limit gambar jika di Webhook agar tidak kehabisan timeout serverless (Vercel)
            const MAX_IMG = Math.min(chapter.images.length, 50); // Hard limiter on serverless max 50 pages for safety

            for (let i = 0; i < MAX_IMG; i++) {
                const imgBuffer = await downloadImage(chapter.images[i]);
                if (imgBuffer) {
                    try {
                        const img = doc.openImage(imgBuffer);
                        doc.addPage({ size: [img.width, img.height] });
                        doc.image(imgBuffer, 0, 0, { width: img.width, height: img.height });
                        successCount++;
                    } catch (e) {
                        console.error(`Gagal merender gambar index ${i}`, e);
                    }
                }
            }
            doc.end();
            if (successCount === 0) return await sendMessage(chatId, `❌ Gagal mengunduh semua gambar.`);

            await new Promise((resolve) => doc.on('end', resolve));
            const finalBuffer = Buffer.concat(buffers);

            await sendDocument(chatId, finalBuffer, fileName, `PDF generated for: ${manga.title}`);

            // Update limit in db
            if (!user.isAdmin && !user.isPremium) {
                user.dailyDownloads.count += 1;
            }
            user.downloadCount = (user.downloadCount || 0) + 1;
            await user.save();

            await sendMessage(chatId, `✅ Sukses! Selesai. (Limit Harian: ${user.isAdmin || user.isPremium ? 'Unlimited' : user.dailyDownloads.count + ' / ' + MAX_LIMIT})`);
         } catch(e) {
            console.error('Compile PDf error:', e);
            await sendMessage(chatId, `❌ Internal Error Timeout Compile PDF.`);
         }
      };

      // Jalan non blocking (Fire and Forget) Note: will finish as long as lambda doesn't freeze immediately.
      compilePdf(); 

      return NextResponse.json({ success: true, message: "Processing async" });
    }

    // Default return HTTP 200
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
