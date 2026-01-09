/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          25: '#eae4d1',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        midnight: {
          50: '#1a1f2e',
          100: '#1e2332',
          200: '#222736',
          300: '#262b3a',
          400: '#2a2f3e',
          500: '#2e3342',
          600: '#323746',
          700: '#363b4a',
          800: '#3a3f4e',
          900: '#050810', // Midnight más oscuro
        },
        'bahai-navy': '#1e3a8a',
        'bahai-gold': '#d97706',
        'bahai-darkgold': '#b45309',
        'bahai-lightgray': '#f8fafc',
        'bahai-darkgray': '#64748b'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1e293b',
            lineHeight: '1.75',
            fontSize: '1.125rem',
            h1: {
              fontFamily: 'Playfair Display, serif',
              fontWeight: '400',
              color: '#0f172a',
              lineHeight: '1.2'
            },
            h2: {
              fontFamily: 'Playfair Display, serif',
              fontWeight: '400',
              color: '#0f172a',
              lineHeight: '1.3'
            },
            h3: {
              fontFamily: 'Playfair Display, serif',
              fontWeight: '400',
              color: '#0f172a',
              lineHeight: '1.4'
            },
            'blockquote p:first-of-type::before': false,
            'blockquote p:last-of-type::after': false,
            blockquote: {
              borderLeftColor: '#e2e8f0',
              borderLeftWidth: '4px',
              paddingLeft: '1.5rem',
              fontStyle: 'normal',
              color: '#475569'
            }
          }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      boxShadow: {
        'elegant': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elegant-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elegant-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}