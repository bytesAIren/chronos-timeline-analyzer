import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: false
  },
  // Serve sample_case/ files as static assets
  publicDir: 'public'
});
