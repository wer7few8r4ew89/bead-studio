/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* 豆豆工坊品牌色板 */
        cream: '#FBF6EE',
        sand: '#F3EAD9',
        'bead-white': '#FFFFFF',
        ink: '#2B2622',
        ash: '#8A8177',
        cherry: '#E8452C',
        yolk: '#FFC93C',
        matcha: '#58A05C',
        sky: '#3E8EDE',
        grape: '#8B5FBF',
        charcoal: '#241F1B',
        /* shadcn 变量色 */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', '"Noto Sans SC"', 'monospace'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1200px',
        tool: '1440px',
      },
      borderRadius: {
        card: '20px',
        tag: '8px',
        cell: '2px',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: '0 2px 0 rgba(43,38,34,.06), 0 12px 32px rgba(43,38,34,.08)',
        'card-hover': '0 4px 0 rgba(43,38,34,.07), 0 20px 44px rgba(43,38,34,.13)',
        bead: 'inset 0 -4px 0 rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.35)',
        'bead-pressed': 'inset 0 4px 0 rgba(0,0,0,.16), inset 0 -2px 0 rgba(255,255,255,.22)',
        'bead-ball': 'inset -4px -6px 0 rgba(0,0,0,.16), inset 4px 5px 0 rgba(255,255,255,.38), 0 4px 0 rgba(43,38,34,.18)',
        'hero-card': '0 4px 0 rgba(43,38,34,.08), 0 32px 64px rgba(43,38,34,.16)',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "bead-drop": {
          "0%": { transform: "translateY(-24px) scale(0.6)", opacity: "0" },
          "60%": { opacity: "1" },
          "80%": { transform: "translateY(2px) scale(1.04)" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "float-bead": {
          "0%, 100%": { transform: "translateY(-6px)" },
          "50%": { transform: "translateY(6px)" },
        },
        "scroll-drop": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "15%": { opacity: "1" },
          "70%": { transform: "translateY(26px)", opacity: "1" },
          "78%": { transform: "translateY(22px)" },
          "86%": { transform: "translateY(26px)" },
          "100%": { transform: "translateY(26px)", opacity: "0" },
        },
        "stamp-in": {
          "0%": { transform: "scale(2.2) rotate(-18deg)", opacity: "0" },
          "60%": { transform: "scale(0.92) rotate(-10deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-12deg)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "bead-drop": "bead-drop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "float-bead": "float-bead 2s ease-in-out infinite",
        "scroll-drop": "scroll-drop 1.8s cubic-bezier(0.34, 1.3, 0.64, 1) infinite",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
