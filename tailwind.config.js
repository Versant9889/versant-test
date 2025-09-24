/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            h2: {
              color: theme('colors.gray.800'),
              fontWeight: '700',
            },
            h3: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            strong: {
              color: theme('colors.gray.800'),
              fontWeight: '700',
            },
            a: {
              color: theme('colors.green.600'),
              '&:hover': {
                color: theme('colors.green.700'),
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.green.500'),
              color: theme('colors.gray.500'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};