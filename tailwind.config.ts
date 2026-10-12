import type { Config } from 'tailwindcss';

// Colours come from the iso kit's light theme tokens (--anatomy-*), set on <body>.
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { strong: 'var(--anatomy-strong)', body: 'var(--anatomy-text)' },
      boxShadow: {
        rule: '0 1px 0 0 var(--anatomy-faint)',
        'rule-top': '0 -1px 0 0 var(--anatomy-faint)',
      },
    },
  },
  plugins: [],
} satisfies Config;
