'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const getErrorMessage = (code) => {
  const map = {
    'auth/user-not-found': 'Email tidak terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/email-already-in-use': 'Email sudah digunakan.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/popup-closed-by-user': 'Login dibatalkan.',
    'auth/network-request-failed': 'Tidak ada koneksi internet.',
    'auth/invalid-credential': 'Email atau password salah.',
  };
  return map[code] || 'Terjadi kesalahan. Silakan coba lagi.';
};

export default function LoginClient() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (e) {
      setError(getErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        router.replace('/');
      } else if (mode === 'register') {
        if (!name.trim()) { setError('Nama tidak boleh kosong'); setLoading(false); return; }
        await registerWithEmail(email, password, name.trim());
        router.replace('/');
      } else {
        await resetPassword(email);
        setInfo('Link reset password telah dikirim ke email kamu!');
      }
    } catch (e) {
      setError(getErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-12 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-3xl text-accent-red tracking-widest">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            </Link>
            <p className="text-text-muted text-sm mt-2">
              {mode === 'login' && 'Masuk untuk menyimpan bookmark'}
              {mode === 'register' && 'Daftar akun baru'}
              {mode === 'reset' && 'Reset password akun kamu'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-2xl">

            {/* Mode tabs */}
            {mode !== 'reset' && (
              <div className="flex bg-bg-elevated rounded-xl p-1 mb-6">
                {['login', 'register'].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setInfo(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize ${mode === m
                      ? 'bg-accent-red text-white shadow-lg'
                      : 'text-text-muted hover:text-text-secondary'
                      }`}
                  >
                    {m === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                ))}
              </div>
            )}

            {/* Google Login */}
            {mode !== 'reset' && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-bg-elevated border border-border hover:border-accent-red transition-all text-sm font-bold text-text-primary disabled:opacity-50 mb-4"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Lanjutkan dengan Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-text-muted text-xs">atau</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Nama</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                    className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-accent-red transition-colors text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  required
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-accent-red transition-colors text-sm"
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 pr-11 text-text-primary placeholder-text-muted outline-none focus:border-accent-red transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPass ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error & Info */}
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}
              {info && (
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-800 rounded-xl px-3 py-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-green-400 text-xs">{info}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-red hover:bg-accent-redDark text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  mode === 'login' ? 'Masuk' :
                    mode === 'register' ? 'Buat Akun' :
                      'Kirim Link Reset'
                )}
              </button>
            </form>

            {/* Forgot & Back links */}
            <div className="mt-4 text-center space-y-2">
              {mode === 'login' && (
                <button
                  onClick={() => { setMode('reset'); setError(''); setInfo(''); }}
                  className="text-xs text-text-muted hover:text-accent-red transition-colors"
                >
                  Lupa password?
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                  className="text-xs text-text-muted hover:text-accent-red transition-colors flex items-center gap-1 mx-auto"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Kembali ke login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
