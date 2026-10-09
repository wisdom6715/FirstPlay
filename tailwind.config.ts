import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        cobalt: '#2563EB',
        lime: '#7DBA55',
        mist: '#F6F8FB',
        line: '#E5EAF1',
        fp: {
          bg: 'var(--fp-bg)',
          text: 'var(--fp-text)',
          muted: 'var(--fp-muted)',
          accent: 'var(--fp-accent)',
          glass: 'var(--fp-glass)',
          'glass-strong': 'var(--fp-glass-strong)',
          border: 'var(--fp-border)',
          line: 'var(--fp-line)',
          pill: 'var(--fp-pill)',
          'pill-text': 'var(--fp-pill-text)'
        }
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        glass: 'var(--fp-shadow)',
        soft: '0 18px 50px rgba(26, 42, 73, 0.08)',
        card: '0 8px 28px rgba(26, 42, 73, 0.06)'
      }
    }
  },
  plugins: []
};

export default config;
