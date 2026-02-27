'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SyncBanner() {
  const { user, loading } = useAuth();

  // Jika masih loading proses pengecekan ATAU user sudah login, sembunyikan banner
  if (loading || user) {
    return null;
  }

  // Jika belum login (tamu), tampilkan banner
  return (
    <div className="px-4 mt-4 mb-2 w-full max-w-2xl mx-auto">
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-3 flex items-start gap-3 shadow-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <p className="text-sm font-bold text-yellow-500">Pemberitahuan Sinkronisasi</p>
          <p className="text-xs text-yellow-400/80 mt-0.5">
            Bagi pengguna lama, silakan <Link href="/login" className="underline font-bold text-yellow-400 hover:text-yellow-300">login</Link> untuk menyinkronkan Library dan Histori bacaan kamu.
          </p>
        </div>
      </div>
    </div>
  );
}