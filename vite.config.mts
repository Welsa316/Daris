import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    // Vite defaults to 5173. When PORT is set by the preview harness
    // (claude --preview) we honor it so the harness can route a free
    // port; otherwise fall back to the project default.
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Socket.IO uses the /socket.io path for both the HTTP handshake
      // and the WebSocket upgrade. `ws: true` flips on protocol switching
      // so dev-mode live chat works the same as production behind Railway.
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      }
    }
  }
});
