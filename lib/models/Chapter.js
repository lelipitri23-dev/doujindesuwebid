import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  manga_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
    required: true,
    index: true,
  },
  title: String,
  slug: String,
  link: String,
  chapter_index: Number,
  images: [String],
}, { timestamps: true });

ChapterSchema.index({ manga_id: 1, slug: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
