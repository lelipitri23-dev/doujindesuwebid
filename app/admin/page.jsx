'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  // State Kirim Notif Massal
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // State Aktivasi Premium
  const [targetUserId, setTargetUserId] = useState('');
  const [premiumDays, setPremiumDays] = useState(30);
  const [activating, setActivating] = useState(false);

  // Cek Admin (Sesuai dengan UID di backend kamu)
  const ADMIN_UIDS = ['BUkIZguy10hnIG8jAooZoycG7ak1'];
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  if (!user) return <div className="p-10 text-center text-white">Silakan login.</div>;
  if (!isAdmin) return <div className="p-10 text-center text-accent-red font-bold">Akses Ditolak. Hanya Admin.</div>;

  // FUNGSI KIRIM BROADCAST
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSendingBroadcast(true);
    try {
      const res = await fetch(`/api/proxy/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.uid,
          title: broadcastTitle,
          message: broadcastMsg
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Notifikasi massal berhasil dikirim!');
        setBroadcastTitle('');
        setBroadcastMsg('');
      } else alert('Gagal: ' + data.message);
    } catch (err) {
      alert('Error server');
    }
    setSendingBroadcast(false);
  };

  // FUNGSI AKTIVASI PREMIUM
  const handleSetPremium = async (e) => {
    e.preventDefault();
    setActivating(true);
    try {
      const res = await fetch(`/api/proxy/users/${targetUserId}/set-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: premiumDays })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sukses! Premium diaktifkan untuk user tersebut selama ${premiumDays} hari.`);
        setTargetUserId('');
      } else alert('Gagal: ' + data.message);
    } catch (err) {
      alert('Error server');
    }
    setActivating(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Navbar />
      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display text-accent-red tracking-wider">PANEL ADMIN</h1>

        {/* Form Kirim Notif Massal */}
        <section className="bg-bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Kirim Notifikasi Massal
          </h2>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <input
              type="text" required
              placeholder="Judul Notifikasi"
              value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-red"
            />
            <textarea
              required rows="3"
              placeholder="Isi pesan notifikasi..."
              value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-red resize-none"
            />
            <button
              disabled={sendingBroadcast}
              className="w-full py-3 bg-accent-red text-white font-bold rounded-xl text-sm disabled:opacity-50"
            >
              {sendingBroadcast ? 'Mengirim...' : 'Kirim ke Semua User'}
            </button>
          </form>
        </section>

        {/* Form Aktivasi Premium */}
        <section className="bg-bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Aktivasi Premium User
          </h2>
          <form onSubmit={handleSetPremium} className="space-y-3">
            <input
              type="text" required
              placeholder="Google ID User (contoh: 1029384756...)"
              value={targetUserId} onChange={e => setTargetUserId(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
            />
            <div>
              <label className="text-xs text-text-muted mb-1 block">Durasi Premium (Hari)</label>
              <input
                type="number" required min="1"
                value={premiumDays} onChange={e => setPremiumDays(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>
            <button
              disabled={activating}
              className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl text-sm disabled:opacity-50"
            >
              {activating ? 'Memproses...' : 'Aktifkan Premium'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}