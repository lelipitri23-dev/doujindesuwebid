'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Save, FileCode2, AlertCircle } from 'lucide-react';

export default function AdminAdsSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    const fetchAdsConfig = async () => {
      if (!user?.googleId) return;
      try {
        const res = await fetch('/api/admin/ads', {
          headers: { 'Authorization': `Bearer ${user.googleId}` }
        });
        const json = await res.json();
        if (json.success) {
          setFileContent(json.data);
        } else {
          setError(json.message);
        }
      } catch (err) {
        setError('Gagal memuat konfigurasi iklan.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdsConfig();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.googleId}`
        },
        body: JSON.stringify({ content: fileContent })
      });
      const json = await res.json();
      
      if (json.success) {
        setSuccessMsg(json.message);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-accent-red" />
            Pengaturan Iklan (lib/ads.js)
          </h1>
          <p className="text-text-muted text-sm mt-1">Edit konfigurasi iklan secara teknikal. Hati-hati karena salah sintaks dapat menyebabkan error.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-red text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-redDark transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-xl font-semibold text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[700px] shadow-sm">
        <div className="bg-bg-elevated/50 px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs text-text-muted">lib/ads.js</span>
        </div>
        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="w-full flex-1 bg-bg-primary text-text-primary font-mono text-sm p-4 outline-none resize-none leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
