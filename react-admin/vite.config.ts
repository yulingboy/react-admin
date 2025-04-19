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
  },
  server: {
    port: 5173, // 前端开发服务器端口
    open: true, // 自动打开浏览器
    proxy: {
      // 配置代理
      '/api': {
        target: 'http://localhost:3000', // 后端服务器地址
        changeOrigin: true, // 支持跨域
        rewrite: path => path.replace(/^\/api/, '') // 去除请求路径中的/api前缀
      }
    }
  }
});
