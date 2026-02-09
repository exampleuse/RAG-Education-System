import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/pages/index',
    },
  ],
  npmClient: 'npm',
  outputPath: 'dist',
  base: '/',
  publicPath: '/',
});
