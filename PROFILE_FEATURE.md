# 🧑‍💻 Fitur Profil Publik — Dokumentasi

## Apa yang Ditambahkan?

### 1. Halaman Profil Publik (`/user/[userId]`)
User lain bisa melihat profil seseorang dengan URL:
```
https://yoursite.com/user/USER_ID
```

**Tampilan profil meliputi:**
- Avatar, nama, handle (@username)
- Badge otomatis berdasarkan jumlah koleksi (💎 Kolektor, 📚 Pembaca Aktif, dsb.)
- Bio singkat (bisa diedit oleh pemilik profil)
- Stats: Sedang Dibaca, Mau Dibaca, Selesai, Dihentikan
- Grid komik dengan tab filter per status

### 2. Reading Status di Bookmark
Setiap bookmark sekarang punya status bacaan:
- 📖 **Sedang Dibaca** — Currently Reading
- 🔖 **Mau Dibaca** — To Read List  
- ✅ **Selesai** — Finished Reading
- ❌ **Dihentikan** — Dropped

### 3. BookmarkButton Baru
Tombol simpan sekarang punya dropdown untuk memilih/mengubah status baca.

### 4. BookmarkList Update
Halaman `/bookmarks` sekarang menampilkan:
- Mini stats bar di atas
- Tab filter per status
- Tombol ubah status di setiap item
- Link ke profil publik

---

## File yang Diubah/Dibuat

| File | Status | Keterangan |
|------|--------|------------|
| `lib/bookmarks.js` | ✏️ Update | Tambah `readingStatus`, fungsi baru |
| `lib/profile.js` | 🆕 Baru | Manage data profil publik di Firestore |
| `app/user/[userId]/page.jsx` | 🆕 Baru | Route halaman profil publik |
| `components/PublicProfile.jsx` | 🆕 Baru | UI profil publik lengkap |
| `components/BookmarkButton.jsx` | ✏️ Update | Dropdown status baca |
| `components/BookmarkList.jsx` | ✏️ Update | Tab filter + status change |
| `components/Navbar.jsx` | ✏️ Update | Link "Profil Saya" di user menu |
| `firestore.rules` | 🆕 Baru | Security rules untuk profil publik |

---

## Setup yang Diperlukan

### A. Update Firestore Security Rules
Buka **Firebase Console → Firestore → Rules**, lalu paste isi dari `firestore.rules`.

### B. Sync Profil Publik saat Login
Untuk memastikan data profil tersedia di `/publicProfiles/{userId}`, panggil `updatePublicProfile()` setelah login:

```js
// Di context/AuthContext.jsx, setelah login berhasil:
import { updatePublicProfile } from '@/lib/profile';

// Setelah signIn/signUp:
await updatePublicProfile(cred.user.uid, {
  displayName: cred.user.displayName,
  photoURL: cred.user.photoURL,
});
```

Atau bisa juga dipanggil di `onAuthStateChanged` saat user pertama kali terdeteksi.

### C. Share Profil
URL profil publik: `/user/{userId}`  
Contoh: `https://yoursite.com/user/abc123xyz`

---

## Firestore Structure

```
publicProfiles/
  {userId}/
    uid: string
    displayName: string
    photoURL: string
    bio: string
    stats: {
      reading: number
      toRead: number
      finished: number
      dropped: number
      total: number
    }
    updatedAt: timestamp

users/
  {userId}/
    bookmarks/
      {mangaSlug}/
        mangaSlug: string
        title: string
        coverImage: string
        type: string
        status: string       ← status manga (Ongoing/Completed)
        readingStatus: string ← status baca (reading/to_read/finished/dropped) [BARU]
        rating: number
        lastChapter: string
        lastChapterSlug: string
        createdAt: timestamp
        updatedAt: timestamp  [BARU]
```
