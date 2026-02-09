import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // Настройка для создания одного HTML файла
        inlineDynamicImports: true,
        format: 'iife', // Immediately Invoked Function Expression
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Убираем режим библиотеки, чтобы создавался полноценный HTML
    outDir: 'dist',
    emptyOutDir: true,
  },
});
