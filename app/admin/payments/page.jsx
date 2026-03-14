'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, RefreshCw, Crown, Wallet, CreditCard, CheckCircle, Clock } from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────
function formatRupiah(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Stat Card ─────────────────────────────────────────────
function MiniStat({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-text-muted text-xs font-semibold">{label}</p>
        <p className="text-text-primary font-bold text-xl leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function PaymentsAdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trakteer');

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/trakteer', {
        headers: { Authorization: `Bearer ${user.uid}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.message);
    } catch {
      setError('Gagal mengambil data Trakteer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
      <p className="text-text-muted text-sm">Mengambil data Trakteer & Premium...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
      <p className="text-red-400 font-semibold">{error}</p>
      <button onClick={load} className="mt-3 text-sm text-accent-red underline">Coba lagi</button>
    </div>
  );

  const supports = data?.trakteerSupports || [];
  const premiumUsers = data?.premiumUsers || [];
  const now = new Date();

  // Kalkulasi dari supports
  const totalIncome = supports.reduce((s, x) => s + (x.amount || 0), 0);
  const premiumSupports = supports.filter(s => s.support_message?.startsWith('PRE-'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trakteer & Premium</h1>
          <p className="text-text-muted text-sm mt-0.5">Riwayat donasi & aktivitas member premium</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-accent-red/40 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Saldo Trakteer" value={formatRupiah(data?.balance || 0)} color="bg-green-500/20 text-green-400" icon={Wallet} />
        <MiniStat label="Total Donasi" value={supports.length} color="bg-blue-500/20 text-blue-400" icon={CreditCard} />
        <MiniStat label="Total Pemasukan" value={formatRupiah(totalIncome)} color="bg-purple-500/20 text-purple-400" icon={Wallet} />
        <MiniStat label="Member Premium" value={premiumUsers.length} color="bg-yellow-500/20 text-yellow-400" icon={Crown} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { key: 'trakteer', label: `Riwayat Donasi (${supports.length})` },
          { key: 'premium', label: `Member Premium (${premiumUsers.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-accent-red text-accent-red'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Trakteer History */}
      {activeTab === 'trakteer' && (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          {supports.length === 0 ? (
            <div className="p-10 text-center text-text-muted text-sm">Belum ada donasi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-elevated">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Supporter</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Pesan</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Nominal</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Metode</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Waktu</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Tipe</th>
                  </tr>
                </thead>
                <tbody>
                  {supports.map((s, i) => {
                    const isPremiumPayment = s.support_message?.startsWith('PRE-');
                    return (
                      <tr key={s.order_id || i} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">{s.supporter_name || 'Anonim'}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {s.support_message ? (
                            <span className={`font-mono text-xs ${isPremiumPayment ? 'text-green-400 font-bold' : 'text-text-secondary'}`}>
                              {s.support_message}
                            </span>
                          ) : (
                            <span className="text-text-muted italic text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-400 whitespace-nowrap">{formatRupiah(s.amount)}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{s.payment_method || '—'}</td>
                        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{timeAgo(s.updated_at)}</td>
                        <td className="px-4 py-3">
                          {isPremiumPayment ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">
                              <Crown className="w-2.5 h-2.5" /> Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                              <CreditCard className="w-2.5 h-2.5" /> Donasi
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Premium Users */}
      {activeTab === 'premium' && (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          {premiumUsers.length === 0 ? (
            <div className="p-10 text-center text-text-muted text-sm">Belum ada member premium.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-elevated">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Premium Hingga</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumUsers.map((u) => {
                    const until = u.premiumUntil ? new Date(u.premiumUntil) : null;
                    const expired = until ? now > until : false;
                    const daysLeft = until && !expired ? Math.ceil((until - now) / 86400000) : null;
                    return (
                      <tr key={u.googleId} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-accent-red/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {u.displayName?.[0] || '?'}
                              </div>
                            )}
                            <span className="font-semibold text-text-primary whitespace-nowrap">{u.displayName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{u.email || '—'}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {until ? formatDate(u.premiumUntil) : '∞ Seumur Hidup'}
                        </td>
                        <td className="px-4 py-3">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                              <Clock className="w-2.5 h-2.5" /> Kadaluarsa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30">
                              <CheckCircle className="w-2.5 h-2.5" />
                              {daysLeft !== null ? `${daysLeft} hari lagi` : 'Aktif'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.pendingOrders > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                              {u.pendingOrders} pending
                            </span>
                          ) : (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
