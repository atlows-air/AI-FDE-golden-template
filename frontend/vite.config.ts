import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// 后端地址。默认本机 8080，可以用环境变量 VITE_API_TARGET 改
const apiTarget = process.env.VITE_API_TARGET ?? 'http://127.0.0.1:8080'

const proxy = { '/api': { target: apiTarget, changeOrigin: true } }

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // 开发时 /api 转发到后端，前端代码里只写相对路径 /api/...
    proxy,
  },
  // 预览（vite preview，pnpm preview 用）同样把 /api 转发到后端
  preview: { proxy },
  build: {
    rollupOptions: {
      output: {
        // 第三方库单独打包，业务代码改动时浏览器缓存仍然有效
        manualChunks: {
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          vue: ['vue', 'vue-router', 'pinia', 'axios'],
        },
      },
    },
    // Element Plus 是整包引入的（Demo 优先开发效率），单个 chunk 会超过默认的 500 KB
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
