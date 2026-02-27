'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { trackLogin, trackSignUp } from '@/lib/analytics';

// Sync user ke BACKEND
import { updatePublicProfile } from '@/lib/profile';

// ─── DAFTAR UID ADMIN ────────────────────────────────────────
// Sumber kebenaran tunggal untuk pengecekan admin (dipakai di seluruh app)
export const ADMIN_UIDS = ['TPuc7EiYeFZcea9HGMe0mwl2ie13'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Cek admin berdasarkan UID (tidak perlu backend)
        const isAdminByUID = ADMIN_UIDS.includes(firebaseUser.uid);

        // 2. Set user dengan default isAdmin & isPremium = false dulu
        //    (belum tampilkan iklan sebelum sync selesai — loading masih true)
        const baseUser = {
          ...firebaseUser,
          isAdmin:   isAdminByUID,
          isPremium: false,
        };

        try {
          // 3. Update profil publik
          updatePublicProfile(firebaseUser.uid, {
            email:       firebaseUser.email       || '',
            displayName: firebaseUser.displayName || '',
            photoURL:    firebaseUser.photoURL    || '',
          });

          // 4. Ambil status premium dari backend
          const res = await fetch(`/api/proxy/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId:    firebaseUser.uid,
              email:       firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL:    firebaseUser.photoURL
            })
          });
          const dbData = await res.json();

          // 5. Gabungkan: admin dari UID lokal, premium dari backend
          if (dbData.success && dbData.data) {
            setUser({
              ...baseUser,
              // Admin: true jika UID cocok ATAU backend menandai admin
              isAdmin:   isAdminByUID || !!dbData.data.isAdmin,
              isPremium: !!dbData.data.isPremium,
            });
          } else {
            // Sync gagal → tetap pakai baseUser (admin by UID masih berlaku)
            setUser(baseUser);
          }
        } catch (error) {
          console.error("Gagal mengambil status premium:", error);
          // Sync gagal → tetap pakai baseUser agar admin tidak kehilangan privilege
          setUser(baseUser);
        }
      } else {
        setUser(null);
      }
      // Loading false HANYA setelah sync selesai (atau gagal)
      // Ini mencegah iklan muncul sebelum status user terkonfirmasi
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    trackLogin('google');
    return result;
  };

  // Login Email
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    trackLogin('email');
    return result;
  };

  // Register Email
  const registerWithEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    trackSignUp('email');
    return cred;
  };

  // Reset password
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Logout
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// [FIX] Fallback yang aman: Jika hook dipanggil di luar AuthProvider, 
// jangan lempar error yang membuat layar mati, cukup kembalikan user: null
export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx || { user: null, loading: false };
}