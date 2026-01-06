import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置为相对路径，这样无论部署在哪个子路径下都能正常访问
  base: './',
});
