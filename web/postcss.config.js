// web/postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss/nesting': {}, // Optional: if you use CSS nesting
    tailwindcss: {},         // Load Tailwind CSS
    autoprefixer: {},        // Load Autoprefixer
    // Add other PostCSS plugins here if needed
  },
};
