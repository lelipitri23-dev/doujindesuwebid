import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// Analytics opsional, kita handle agar tidak error di server side
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjcrntHoKmkdAsZr3ffcLqS1NL2lRN8Y8",
  authDomain: "doujindesuapk.firebaseapp.com",
  projectId: "doujindesuapk",
  storageBucket: "doujindesuapk.firebasestorage.app",
  messagingSenderId: "31970708581",
  appId: "1:31970708581:web:eb7d33787587ec3b8b4a8c",
  measurementId: "G-CPSKY8VFN8"
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