import { defineConfig } from 'vite';

export default defineConfig({
  base: '/super-duper-mushroom-house/',
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
