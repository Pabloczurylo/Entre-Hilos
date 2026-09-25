/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // ── Brand palette ──────────────────────────────────────
        mist:      '#f4f3f1',
        peony:     '#f2d1d4',
        mauve:     '#d8959b',
        sage:      '#829672',
        evergreen: '#344c3d',
        'text-muted': '#627568',
        'card-subtle-border': '#eedddb',

        // ── Surface system ────────────────────────────────────
        surface:                    '#faf9f7',
        'surface-dim':              '#dbdad8',
        'surface-bright':           '#faf9f7',
        'surface-white':            '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f4f3f1',
        'surface-container':        '#efeeec',
        'surface-container-high':   '#e9e8e6',
        'surface-container-highest':'#e3e2e0',
        'surface-variant':          '#e3e2e0',
        'surface-tint':             '#864f54',
        'inverse-surface':          '#2f3130',
        'inverse-on-surface':       '#f1f1ef',

        // ── On-surface ────────────────────────────────────────
        'on-surface':         '#1a1c1b',
        'on-surface-variant': '#524344',
        'on-background':      '#1a1c1b',

        // ── Primary ───────────────────────────────────────────
        primary:                  '#864f54',
        'on-primary':             '#ffffff',
        'primary-container':      '#d8959b',
        'on-primary-container':   '#5e2d33',
        'inverse-primary':        '#fbb4ba',
        'primary-fixed':          '#ffdadc',
        'primary-fixed-dim':      '#fbb4ba',
        'on-primary-fixed':       '#360d14',
        'on-primary-fixed-variant': '#6b383e',

        // ── Secondary ─────────────────────────────────────────
        secondary:                '#516444',
        'on-secondary':           '#ffffff',
        'secondary-container':    '#d1e7be',
        'on-secondary-container': '#556848',
        'secondary-fixed':        '#d4e9c0',
        'secondary-fixed-dim':    '#b8cda6',
        'on-secondary-fixed':     '#101f06',
        'on-secondary-fixed-variant': '#3a4c2e',

        // ── Tertiary ──────────────────────────────────────────
        tertiary:                 '#71585b',
        'on-tertiary':            '#ffffff',
        'tertiary-container':     '#bd9fa2',
        'on-tertiary-container':  '#4c3639',
        'tertiary-fixed':         '#fcdadd',
        'tertiary-fixed-dim':     '#dfbfc2',
        'on-tertiary-fixed':      '#291719',
        'on-tertiary-fixed-variant': '#584144',

        // ── Error ─────────────────────────────────────────────
        error:              '#ba1a1a',
        'on-error':         '#ffffff',
        'error-container':  '#ffdad6',
        'on-error-container': '#93000a',

        // ── Outline ───────────────────────────────────────────
        outline:         '#847374',
        'outline-variant': '#d6c2c2',

        // ── Shadcn tokens ─────────────────────────────────────
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        'primary-shadcn': {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input:  'var(--input)',
        ring:   'var(--ring)',
      },

      fontSize: {
        'display-lg':        ['3rem',     { lineHeight: '3.5rem',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['2.25rem',  { lineHeight: '2.75rem', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg':       ['2rem',     { lineHeight: '2.5rem',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile':['1.5rem',   { lineHeight: '2rem',    fontWeight: '700' }],
        'headline-md':       ['1.25rem',  { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg':           ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md':           ['0.9375rem',{ lineHeight: '1.5rem',  fontWeight: '400' }],
        'body-sm':           ['0.8125rem',{ lineHeight: '1.25rem', fontWeight: '400' }],
        'label-lg':          ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md':          ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.02em', fontWeight: '600' }],
      },

      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      spacing: {
        'space-xs':  '0.25rem',
        'space-sm':  '0.5rem',
        'space-md':  '1rem',
        'space-lg':  '1.5rem',
        'space-xl':  '2rem',
        'space-2xl': '3rem',
        'gutter':    '1rem',
        'gutter-desktop': '1.5rem',
        'margin':    '1rem',
        'margin-tablet': '1.5rem',
        'margin-desktop': '2.5rem',
      },

      boxShadow: {
        'card': '0px 4px 20px -2px rgba(52, 76, 61, 0.04), 0px 2px 6px -1px rgba(216, 149, 155, 0.06)',
        'card-hover': '0px 10px 25px -4px rgba(52, 76, 61, 0.08), 0px 4px 10px -2px rgba(216, 149, 155, 0.12)',
        'nav': '0px 1px 8px rgba(52, 76, 61, 0.04)',
        'button': '0px 6px 20px rgba(216, 149, 155, 0.4)',
      },

      animation: {
        'fade-slide-in': 'fadeSlideIn 0.25s ease forwards',
        'pulse-dot': 'pulseDot 2s infinite',
      },

      keyframes: {
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
