import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// Analytics opsional, kita handle agar tidak error di server side
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB3I1iEB4BtR1Tj3Z2AEF7zvGj5qPbYWzs",
  authDomain: "doujindesu-b0b55.firebaseapp.com",
  projectId: "doujindesu-b0b55",
  storageBucket: "doujindesu-b0b55.firebasestorage.app",
  messagingSenderId: "1058397051950",
  appId: "1:1058397051950:web:e6294330f9dd1a0b9213bf",
  measurementId: "G-B9GCP93VJE"
};

// Mencegah inisialisasi ganda saat hot-reload Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Analytics hanya jalan di browser (client-side)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth };
