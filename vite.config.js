// vite.config.js
// Set VITE_BASE_URL env var when deploying to a GitHub Pages sub-path, e.g.:
//   VITE_BASE_URL=/parq-dashboard/ npm run build
// Leave unset for local dev or a root deployment.

export default {
  base: process.env.VITE_BASE_URL ?? '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
};
