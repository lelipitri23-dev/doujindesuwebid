'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { X, Loader2, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      
      // Jika sukses
      onClose();
      router.push('/bookmark'); // Redirect ke bookmark
      window.dispatchEvent(new Event('storage')); // Update UI bookmark
    } catch (err) {
      console.error(err);
      let msg = "Gagal login dengan Google.";
      if (err.code === 'auth/popup-closed-by-user') msg = "Login dibatalkan.";
      if (err.code === 'auth/popup-blocked') msg = "Popup login terblokir browser.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div 
        className="bg-card border border-gray-800 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Tombol Close */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-darker rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
             {/* Icon Gembok / User */}
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Selamat Datang
          </h2>
          <p className="text-sm text-gray-400">
            Masuk untuk menyimpan komik favorit, sinkronisasi bookmark, dan akses fitur lainnya.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tombol Google Login */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg group"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            ) : (
                <>
                    {/* SVG Logo Google Resmi */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                </>
            )}
        </button>

        <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-500">
                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
            </p>
        </div>

      </div>
    </div>
  );
}