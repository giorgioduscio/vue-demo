import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Importa il plugin Vue

export default defineConfig({
  plugins: [vue()], // Aggiungi il plugin Vue
  server: {
    watch: {
      usePolling: true, // Abilita polling per Docker
    },
    host: true,
    port: 8080,
    strictPort: true,
  },
});
