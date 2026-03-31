import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      spacing: {
        'gr-1': '0.25rem',
        'gr-2': '0.5rem',
        'gr-3': '0.75rem',
        'gr-3.5': '0.875rem',
        'gr-4': '1rem',
        'gr-5': '1.5rem',
        'gr-6': '2.25rem',
        'gr-7': '3.375rem',
        'gr-8': '5rem',
        'gr-9': '7.5rem',
      },
      fontSize: {
        // Refined scaled standard fonts (~1.15x) for premium readability
        'xs': ['0.8625rem', { lineHeight: '1.25rem' }],
        'sm': ['1.00625rem', { lineHeight: '1.5rem' }],
        'base': ['1.15rem', { lineHeight: '1.75rem' }],
        'lg': ['1.29375rem', { lineHeight: '2rem' }],
        'xl': ['1.4375rem', { lineHeight: '2.25rem' }],
        '2xl': ['1.725rem', { lineHeight: '2.5rem' }],
        '3xl': ['2.15625rem', { lineHeight: '2.75rem' }],
        '4xl': ['2.5875rem', { lineHeight: '3rem' }],
        '5xl': ['3.45rem', { lineHeight: '1' }],
        '6xl': ['4.3125rem', { lineHeight: '1' }],
        '7xl': ['5.175rem', { lineHeight: '1' }],
        
        'gr-xs': ['0.75rem', { lineHeight: '1.5' }],
        'gr-sm': ['0.875rem', { lineHeight: '1.5' }],
        'gr-base': ['1rem', { lineHeight: '1.5' }],
        'gr-lg': ['1.125rem', { lineHeight: '1.5' }],
        'gr-xl': ['1.25rem', { lineHeight: '1.4' }],
        'gr-2xl': ['1.5rem', { lineHeight: '1.3' }],
        'gr-3xl': ['2rem', { lineHeight: '1.2' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        gr: "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
