import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const historySchema = new mongoose.Schema({
  type: String,
  slug: String,
  title: String,
  thumb: String,
  lastChapterTitle: String,
  lastChapterSlug: String,
  lastRead: { type: Date, default: Date.now },
});

const librarySchema = new mongoose.Schema({
  slug: { type: String, required: true },
  mangaData: { type: mongoose.Schema.Types.Mixed },
  addedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  displayName: String,
  photoURL: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 100 },
  isAdmin: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date, default: null },
  dailyDownloads: {
    date: { type: String, default: '' },
    count: { type: Number, default: 0 },
  },
  downloadCount: { type: Number, default: 0 },
  lastDownloadDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, index: true },
  notifications: [notificationSchema],
  history: [historySchema],
  library: [librarySchema],
  telegramId: { type: String, default: null },
  telegramSyncCode: { type: String, default: null },
  hasUsedTrial: { type: Boolean, default: false },
  // Dipakai untuk hapus otomatis akun yang tidak login dalam periode tertentu.
  lastLoginAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
