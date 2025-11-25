/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom Cozy Palette from original design
        'bg-warm': '#FFF8F3',
        'text-coffee': '#4A4036',
        'accent-sage': '#88B795',
        'accent-coral': '#FF9B85',
        'accent-sun': '#FFD275',
        'surface-white': '#FFFFFF',
      },
      fontFamily: {
        'nunito': ['var(--font-nunito)', 'sans-serif'],
        'lora': ['var(--font-lora)', 'serif'],
      },
      animation: {
        'float': 'float 25s infinite alternate',
        'pop-in': 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(40px, 40px) rotate(5deg)' },
        },
        popIn: {
          'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}