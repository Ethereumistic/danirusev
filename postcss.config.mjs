const config = {
  plugins: {
    "@tailwindcss/postcss": {
      safelist: [
        {
          pattern: /from-(red|yellow|blue|green|pink|purple|amber|sky|cyan|teal|emerald|indigo)-(400|500|600)/,
        },
        {
          pattern: /via-(red|yellow|blue|green|pink|purple|amber|sky|cyan|teal|emerald|indigo)-(400|500|600)/,
        },
        {
          pattern: /to-(red|yellow|blue|green|pink|purple|amber|sky|cyan|teal|emerald|indigo)-(400|500|600)/,
        },
        // Border styles for hover effects
        'border-solid',
        'border-dashed',
        'border-double',
        'border-dotted',
        'group-hover:border-dashed',
        'group-hover:border-double',
        'group-hover:border-dotted',
      ],
    },
  },
};

export default config;