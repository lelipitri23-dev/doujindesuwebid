export const metadata = {
  title: 'Terms of Service - Doujindesu',
  description: 'Syarat dan Ketentuan layanan Doujindesu.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary py-10 px-4">
      <div className="max-w-3xl mx-auto bg-bg-elevated p-8 rounded-lg border border-border">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="mb-4">Terakhir diperbarui: 28 Februari 2026</p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">1. Penerimaan Syarat</h2>
        <p className="mb-4">
          Dengan mengakses dan menggunakan website doujindesu.web.id, kamu setuju untuk terikat oleh Syarat dan Ketentuan Layanan ini serta Kebijakan Privasi kami. Jika kamu tidak setuju, mohon untuk tidak menggunakan layanan ini.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">2. Penggunaan Layanan</h2>
        <p className="mb-4">
          Layanan ini disediakan hanya untuk keperluan hiburan pribadi. Kamu setuju untuk tidak:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Menggunakan layanan ini untuk tujuan ilegal atau melanggar hukum.</li>
          <li>Mencoba mengganggu kinerja server atau keamanan website kami.</li>
          <li>Membuat banyak akun palsu untuk menyalahgunakan sistem.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">3. Akun Pengguna</h2>
        <p className="mb-4">
          Kamu bertanggung jawab untuk menjaga kerahasiaan akun kamu. Kami berhak menangguhkan atau menghapus akun yang terbukti melanggar aturan penggunaan layanan.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">4. Penafian (Disclaimer)</h2>
        <p className="mb-4">
          Layanan disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak menjamin bahwa website akan selalu bebas dari gangguan teknis atau error. Konten yang disediakan di kumpulkan dari berbagai sumber di internet.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">5. Perubahan Ketentuan</h2>
        <p className="mb-4">
          Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
        </p>
        
        <h2 className="text-xl font-bold text-white mt-6 mb-2">6. Kontak</h2>
        <p className="mb-4">
          Untuk pertanyaan terkait ketentuan layanan, silakan hubungi kami melalui:{' '}
          <a href="mailto:support-doujindesu@googlegroups.com" className="text-accent-red hover:underline">
            support-doujindesu@googlegroups.com
          </a>
        </p>
      </div>
    </div>
  );
}