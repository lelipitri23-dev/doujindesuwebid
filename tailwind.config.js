/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080c14',
          secondary: '#0d1220',
          card: '#1a1a1a',
          elevated: '#1a2235',
        },
        accent: {
          red: '#e97991',       // → biru utama (blue-500)
          redDark: '#d881cc',   // → biru gelap (blue-600)
          orange: '#f97316',    // → biru muda (blue-400)
          gold: '#f59e0b',      // → biru pucat (blue-300)
        },
        text: {
          primary: '#9e9e9e',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        border: '#1a2235',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)',
        'gradient-hero': 'linear-gradient(135deg, #080c14 0%, #0d1a2e 50%, #080c14 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-red': 'pulseBlue 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBlue: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
      },
    },
  },
  plugins: [],
};
