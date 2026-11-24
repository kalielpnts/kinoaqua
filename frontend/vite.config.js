import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento o frontend chama /api e o Vite encaminha para a API local.
// Em producao (Vercel) defina VITE_API_URL com a URL do backend no Railway.
const target = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:3001';
const proxy = { '/api': { target, changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, allowedHosts: true, proxy },
  preview: { host: true, port: 4173, allowedHosts: true, proxy },
});
