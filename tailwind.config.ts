import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Action Colors — Sudama Bhel
        primary: '#D32F2F',          // Chilli Red — Main CTA buttons
        'accent-gold': '#F5A623',    // Turmeric Gold — Secondary / Highlights & Badges
        'accent-green': '#2E7D32',   // Mint Green — Veg Icon / WhatsApp / Success
        'accent-brown': '#3E1F16',   // Tamarind Brown — Dark Cards / Header accents
        // UI & Background Neutrals
        background: '#FFFDF9',       // Warm Off-White — App Background
        surface: '#FFFFFF',          // Pure White — Card & Modal Background
        'text-dark': '#1F2421',      // Charcoal — Primary Text & Headings
        'text-muted': '#636E72',     // Muted Slate — Secondary Text / Descriptions
        border: '#EAE0D5',           // Light Sand — Borders & Dividers
        'cart-bar': '#1E2022',       // Deep Black — Sticky Bottom Cart Bar
      },
      fontFamily: {
        georgia: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 20px rgba(0,0,0,0.08)',
        premium: '0 12px 28px rgba(211,47,47,0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
