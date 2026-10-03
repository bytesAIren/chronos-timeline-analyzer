import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const demoMode = mode === 'demo';

  return {
  base: './',
  define: {
    __CHRONOS_DEMO__: JSON.stringify(demoMode),
    ...(demoMode ? {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(''),
      'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify('gemini-2.5-flash')
    } : {})
  },
  server: {
    port: 5173,
    open: false
  },
  // Serve sample_case/ files as static assets
  publicDir: 'public'
  };
});
