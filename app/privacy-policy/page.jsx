export const metadata = {
  title: 'Privacy Policy',
  description: 'Kebijakan Privasi untuk layanan Doujindesu.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary py-10 px-4">
      <div className="max-w-3xl mx-auto bg-bg-elevated p-8 rounded-lg border border-border">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4">Terakhir diperbarui: 28 Februari 2026</p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">1. Informasi yang Kami Kumpulkan</h2>
        <p className="mb-4">
          Saat kamu menggunakan layanan login menggunakan akun Google (Google OAuth), kami hanya meminta akses ke informasi profil dasar kamu. Informasi tersebut meliputi: 
          <strong> Alamat Email, Nama, dan Foto Profil</strong>.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">2. Penggunaan Informasi</h2>
        <p className="mb-4">
          Data yang kami dapatkan dari Google hanya digunakan secara eksklusif untuk:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Membuat dan mengelola akun pengguna kamu di website doujindesu.web.id.</li>
          <li>Menyimpan preferensi membaca, riwayat, dan bookmark komik kamu.</li>
          <li>Mengidentifikasi sesi login kamu agar tetap aman.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">3. Keamanan dan Berbagi Data</h2>
        <p className="mb-4">
          Kami <strong>tidak pernah</strong> menjual, menyewakan, atau membagikan data pribadi kamu kepada pihak ketiga mana pun. Data kamu disimpan dengan aman di database kami dan hanya digunakan untuk keperluan internal website.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">4. Penghapusan Data</h2>
        <p className="mb-4">
          Jika kamu ingin menghapus akun dan seluruh data yang terkait dari server kami, kamu dapat menghubungi kami melalui email dukungan di bawah ini.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">5. Kontak Kami</h2>
        <p className="mb-4">
          Jika kamu memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:{' '}
          <a href="mailto:support-doujindesu@googlegroups.com" className="text-accent-red hover:underline">
            support-doujindesu@googlegroups.com
          </a>
        </p>
      </div>
    </div>
  );
}