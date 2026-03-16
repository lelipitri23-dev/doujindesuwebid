'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, BookOpen, Loader2, Save, Trash2, Plus, Image as ImageIcon, Edit } from 'lucide-react';
import Link from 'next/link';

export default function AdminEditManga({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  
  // States untuk modal/form Chapter
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [chapterForm, setChapterForm] = useState({ slug: '', title: '', chapter_index: '', images: '' });

  const [formData, setFormData] = useState({
    title: '', alternativeTitle: '', slug: '', thumb: '', views: 0, synopsis: '',
    metadata: {
      status: 'Ongoing', type: 'Manga', series: '', author: '', rating: '0', created: ''
    },
    tags: ''
  });

  const fetchData = useCallback(async () => {
    if (!user?.googleId) return;
    try {
      const res = await fetch(`/api/admin/mangas/${params.id}`, {
        headers: { 'Authorization': `Bearer ${user.googleId}` }
      });
      const json = await res.json();
      
      if (json.success) {
        const d = json.data.manga;
        setFormData({
          title: d.title || '',
          alternativeTitle: d.alternativeTitle || '',
          slug: d.slug || '',
          thumb: d.thumb || '',
          views: d.views || 0,
          metadata: {
            status: d.metadata?.status || 'Ongoing',
            type: d.metadata?.type || 'Manga',
            series: d.metadata?.series || '',
            author: d.metadata?.author || '',
            rating: d.metadata?.rating || '0',
            created: d.metadata?.created || '',
          },
          synopsis: d.synopsis || '',
          tags: d.tags?.join(', ') || ''
        });
        setChapters(json.data.chapters || []);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Gagal memuat data manga.');
    } finally {
      setLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('metadata.')) {
      const metaKey = name.split('.')[1];
      setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, [metaKey]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateManga = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    
    const payload = {
      ...formData,
      views: Number(formData.views) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/admin/mangas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.googleId}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
         alert('✅ Manga berhasil diperbarui!');
      } else {
         alert('Gagal: ' + json.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------------
  // MANAJEMEN CHAPTER
  // ----------------------------------------------------------------------
  
  const handleChapterChange = (e) => {
    const { name, value } = e.target;
    setChapterForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddChapter = () => {
    setEditingChapterId(null);
    setChapterForm({ slug: '', title: '', chapter_index: '', images: '' });
    setShowChapterForm(true);
  };

  const openEditChapter = (ch) => {
    setEditingChapterId(ch._id);
    setChapterForm({
      slug: ch.slug || '',
      title: ch.title || '',
      chapter_index: ch.chapter_index || '',
      images: ch.images?.join('\n') || ''
    });
    setShowChapterForm(true);
  };

  const saveChapter = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    const payload = {
      manga_id: params.id,
      slug: chapterForm.slug,
      title: chapterForm.title,
      chapter_index: parseFloat(chapterForm.chapter_index) || 0,
      images: chapterForm.images.split('\n').map(img => img.trim()).filter(Boolean)
    };

    const method = editingChapterId ? 'PUT' : 'POST';
    const url = editingChapterId 
      ? `/api/admin/chapters/${editingChapterId}` 
      : `/api/admin/chapters`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.googleId}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setShowChapterForm(false);
        fetchData(); // reload chapter list
      } else {
        alert('Gagal: ' + json.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const deleteChapter = async (id, title) => {
    if (!confirm(`Hapus permanen ${title}?`)) return;
    try {
      const res = await fetch(`/api/admin/chapters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.googleId}` }
      });
      if ((await res.json()).success) {
        fetchData();
      } else {
        alert('Gagal menghapus');
      }
    } catch {
      alert('Error network');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent-red" /></div>;
  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/mangas" className="p-2 transition-colors rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            Edit: {formData.title}
          </h1>
          <p className="text-text-muted text-sm mt-1">ID: <span className="font-mono">{params.id}</span></p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Kolom Kiri: Edit Meta Manga */}
        <form onSubmit={handleUpdateManga} className="w-full lg:w-1/2 bg-bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
           <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3 mb-2">
             <BookOpen className="w-5 h-5 text-accent-red" /> Data Utama Manga
           </h2>
           
           <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Judul Komik</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Slug URL</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Thumbnail</label>
                  <input name="thumb" value={formData.thumb} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Penulis</label>
                  <input name="metadata.author" value={formData.metadata.author} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Tipe (doujinshi/manhwa/manga)</label>
                  <select 
                    name="metadata.type"
                    value={formData.metadata.type} 
                    onChange={handleChange}
                    className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none appearance-none"
                  >
                    <option value="manga">manga</option>
                    <option value="manhwa">manhwa</option>
                    <option value="doujinshi">doujinshi</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Status (Finished/Publishing)</label>
                  <select 
                    name="metadata.status"
                    value={formData.metadata.status} 
                    onChange={handleChange}
                    className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none appearance-none"
                  >
                    <option value="Publishing">Publishing</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Judul Alternatif</label>
                  <input name="alternativeTitle" value={formData.alternativeTitle} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-text-primary block mb-1">Series</label>
                  <input name="metadata.series" value={formData.metadata.series} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-sm font-semibold text-text-primary block mb-1">Rating</label>
                   <input type="text" name="metadata.rating" value={formData.metadata.rating} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
                <div className="flex-1">
                   <label className="text-sm font-semibold text-text-primary block mb-1">Created / Rilis</label>
                   <input type="text" name="metadata.created" value={formData.metadata.created} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
                <div className="flex-1">
                   <label className="text-sm font-semibold text-text-primary block mb-1">Views</label>
                   <input type="number" name="views" value={formData.views} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Tags/Genre (Dipisah Koma)</label>
                <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
              </div>

              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Sinopsis</label>
                <textarea name="synopsis" value={formData.synopsis} onChange={handleChange} rows={5} className="w-full bg-bg-primary border border-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red outline-none" />
              </div>

           </div>

           <button type="submit" disabled={saving} className="w-full bg-blue-600/20 text-blue-500 border border-blue-600 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-4">
             {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5"/> Simpan Perubahan</>}
           </button>
        </form>

        {/* Kolom Kanan: Daftar Chapter */}
        <div className="w-full lg:w-1/2 bg-bg-card border border-border rounded-2xl shadow-sm flex flex-col h-[700px]">
           <div className="p-4 border-b border-border flex items-center justify-between bg-bg-elevated/50">
             <h2 className="text-lg font-bold flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-accent-red" /> Daftar Chapter ({chapters.length})
             </h2>
             <button onClick={openAddChapter} className="flex items-center gap-1 bg-accent-red text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-accent-redDark">
               <Plus className="w-4 h-4"/> Tambah
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {chapters.length === 0 ? (
               <div className="text-center text-text-muted mt-10">Belum ada chapter.</div>
             ) : chapters.map(ch => (
               <div key={ch._id} className="flex items-center justify-between bg-bg-primary border border-border p-3 rounded-xl hover:bg-bg-elevated transition-colors">
                 <div>
                   <p className="font-bold text-sm text-text-primary text-blue-400">Chapter {ch.chapter_index}</p>
                   <p className="text-xs text-text-muted font-mono">{ch.slug}</p>
                   <p className="text-[10px] text-text-secondary mt-1">{ch.images?.length || 0} Gambar</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => openEditChapter(ch)} className="p-2 text-text-muted hover:text-blue-400 bg-bg-card border border-border rounded-lg">
                     <Edit className="w-4 h-4" />
                   </button>
                   <button onClick={() => deleteChapter(ch._id, ch.title)} className="p-2 text-text-muted hover:text-red-400 bg-bg-card border border-border rounded-lg">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Modal Form Chapter */}
      {showChapterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <form onSubmit={saveChapter} className="bg-bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-border bg-bg-elevated flex justify-between items-center">
               <h3 className="font-bold text-lg">{editingChapterId ? 'Edit Chapter' : 'Tambah Chapter Baru'}</h3>
               <button type="button" onClick={() => setShowChapterForm(false)} className="text-text-muted hover:text-white">&times; Tutup</button>
             </div>
                          <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs font-semibold mb-1 block text-text-muted">Nomor Chapter <span className="text-red-500">*</span></label>
                    <input required type="number" step="0.1" name="chapter_index" value={chapterForm.chapter_index} onChange={handleChapterChange} placeholder="Misal: 1.5" className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-sm focus:border-accent-red outline-none" />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <label className="text-xs font-semibold mb-1 block text-text-muted">Judul Chapter <span className="text-red-500">*</span></label>
                    <input required name="title" value={chapterForm.title} onChange={handleChapterChange} placeholder="Chapter 1" className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-sm focus:border-accent-red outline-none" />
                  </div>
                </div>  
               <div>
                 <label className="text-xs font-semibold mb-1 block text-text-muted">Slug URL <span className="text-red-500">*</span></label>
                 <input required name="slug" value={chapterForm.slug} onChange={handleChapterChange} placeholder="one-piece-chapter-1" className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-sm focus:border-accent-red outline-none" />
               </div>

               <div>
                 <label className="text-xs font-semibold mb-1 block text-accent-red">Daftar Link Gambar (1 per baris) <span className="text-red-500">*</span></label>
                 <textarea required name="images" value={chapterForm.images} onChange={handleChapterChange} rows={10} placeholder="https://host.com/img1.jpg&#10;https://host.com/img2.jpg" className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-sm font-mono focus:border-accent-red outline-none whitespace-pre" />
                 <p className="text-[10px] text-text-muted mt-1">Sistem akan membaca setiap baris enter sebagai 1 blok gambar saat dirender.</p>
               </div>
             </div>

              <div className="p-4 border-t border-border bg-bg-elevated flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={() => setShowChapterForm(false)} className="w-full sm:w-auto px-4 py-2 font-bold text-sm text-text-muted hover:text-white border border-border sm:border-transparent rounded-xl sm:rounded-none">Batal</button>
                <button type="submit" className="w-full sm:w-auto px-6 py-2 font-bold text-sm bg-accent-red text-white rounded-xl hover:bg-accent-redDark transition-colors shadow-lg">Simpan Chapter</button>
              </div>
           </form>
        </div>
      )}

    </div>
  );
}
