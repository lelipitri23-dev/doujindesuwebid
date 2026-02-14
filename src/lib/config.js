export const SITE_CONFIG = {
  name: process.env.SITE_NAME || 'Doujindesu',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  
  // SEO & Metadata
  description: process.env.SITE_DESCRIPTION || 'Doujindesu adalah website download dan baca doujin bahasa indonesia terbaru dan terlengkap. Kamu bisa membaca berbagai macam doujin secara gratis di Doujindesu!',
  keywords: (process.env.SITE_KEYWORDS || 'doujindesu, doujinshi, doujindeusu xxx, dojindesu tv, manga, manhwa').split(', '),
  
  // Socials / External Links (Opsional, agar tidak hardcode di component)
  socials: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '#',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '#',
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || '#',
    discord: process.env.NEXT_PUBLIC_SOCIAL_DISCORD || '#',
  }
};