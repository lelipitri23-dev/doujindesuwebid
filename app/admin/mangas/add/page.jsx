'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, BookPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminAddManga() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states based on Schema
  const [formData, setFormData] = useState({
    title: '',
    alternativeTitle: '',
    slug: '',
    thumb: '',
    views: 0,
    synopsis: '',
    metadata: {
      status: 'Ongoing',
      type: 'Manga',
      series: '',
      author: '',
      rating: '0',
      created: ''
    },
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('metadata.')) {
      const metaKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metaKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Auto-generate slug from title if slug is empty/untouched
        ...(name === 'title' && !prev.slug && {
          slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        })
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!formData.title || !formData.slug) {
      setError('Judul dan Slug wajib diisi!');
      return;
    }

    setLoading(true);
    setError(null);

    // Parse array data
    const payload = {
      ...formData,
      rating: parseFloat(formData.rating) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const res = await fetch('/api/admin/mangas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        alert('✅ Manga berhasil ditambahkan!');
        router.push('/admin/mangas');
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/admin/mangas"
          className="p-2 transition-colors rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookPlus className="w-6 h-6 text-accent-red" />
            Tambah Manga Baru
          </h1>
          <p className="text-text-muted text-sm mt-1">Isi detail komik ke dalam database utama</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-4 rounded-xl font-medium">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-text-primary">Judul Komik *</label>
            <input
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Cth: One Piece"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red focus:ring-1 focus:ring-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2 lg:col-span-2 text-text-secondary">
            <label className="text-sm font-semibold text-text-primary">Judul Alternatif (Opsional)</label>
            <input
              name="alternativeTitle"
              value={formData.alternativeTitle}
              onChange={handleChange}
              placeholder="Cth: ワンピース"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red focus:ring-1 focus:ring-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2 text-text-secondary">
            <label className="text-sm font-semibold text-text-primary">Slug URL (Unik) *</label>
            <input
              required
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="one-piece"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red focus:ring-1 focus:ring-accent-red outline-none transition-all"
            />
            <p className="text-xs text-text-muted">Akan menjadi URL: /manga/<strong>{formData.slug || '...'}</strong></p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">URL Thumbnail (Kecil)</label>
            <input
              name="thumb"
              value={formData.thumb}
              onChange={handleChange}
              placeholder="https://.../thumb.jpg"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Penulis / Author</label>
            <input
              name="metadata.author"
              value={formData.metadata.author}
              onChange={handleChange}
              placeholder="Eiichiro Oda"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2 flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-text-primary block mb-1">Tipe (doujinshi/manhwa/manga)</label>
              <select
                name="metadata.type"
                value={formData.metadata.type}
                onChange={handleChange}
                className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all appearance-none"
              >
                <option value="manga">Manga</option>
                <option value="manhwa">Manhwa</option>
                <option value="doujinshi">Doujinshi</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-text-primary block mb-1">Status (Finished/Publishing)</label>
              <select
                name="metadata.status"
                value={formData.metadata.status}
                onChange={handleChange}
                className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all appearance-none"
              >
                <option value="Publishing">Publishing</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Rating (Max 10)</label>
            <input
              type="text" placeholder="9.5"
              name="metadata.rating" value={formData.metadata.rating} onChange={handleChange}
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Seri / Series</label>
            <input
              type="text" placeholder="One Piece"
              name="metadata.series" value={formData.metadata.series} onChange={handleChange}
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Dibuat / Rilis</label>
            <input
              type="text" placeholder="2023"
              name="metadata.created" value={formData.metadata.created} onChange={handleChange}
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-text-primary">Genre / Tags (Pisahkan dengan Koma)</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Action, Adventure, Shounen, dll"
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-text-primary">Sinopsis Singkat</label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={4}
              placeholder="Kisah tentang seorang pemuda yang menemukan..."
              className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-3 focus:border-accent-red outline-none transition-all"
            />
          </div>

        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-accent-red text-white px-8 py-3 rounded-xl font-bold hover:bg-accent-redDark transition-colors flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Manga'}
          </button>
        </div>
      </form>
    </div>
  );
}
