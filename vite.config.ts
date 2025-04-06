import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src')
      // '@': path.resolve(__dirname, './src')
      '@': '/src' // 设置别名
    }
  }
});
