import mongoose from 'mongoose';

const MangaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  alternativeTitle: String,
  slug: { type: String, required: true, unique: true, index: true },
  thumb: String,
  synopsis: String,
  views: { type: Number, default: 0 },
  metadata: {
    status: String,
    type: { type: String },
    series: String,
    author: String,
    rating: String,
    created: String,
  },
  tags: [String],
}, { timestamps: true });

export default mongoose.models.Manga || mongoose.model('Manga', MangaSchema);
