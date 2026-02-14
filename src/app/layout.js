import './globals.css';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/lib/config'; // Import config

const inter = Inter({ subsets: ['latin'] });

// --- KONFIGURASI SEO GLOBAL ---
export const metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: `${SITE_CONFIG.name} - Baca & Download Doujinshi Bahasa Indonesia`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  openGraph: {
    title: `${SITE_CONFIG.name} - Baca & Download Doujinshi Bahasa Indonesia`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.name,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-dark text-white flex flex-col min-h-screen`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}