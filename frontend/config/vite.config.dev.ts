import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      fs: {
        strict: true,
      },
      proxy: {
/*
        '/kubeadmin/api/k8s/terminal': {
          target: 'ws://127.0.0.1:3000/kubeadmin/api/k8s/terminal',
          changeOrigin: true,
          secure: false,
          ws: true,
          // rewrite: (path) => path.replace(/^\/upload/, '/upload'), // 可选：重写路径
        },
*/
        '/kubeadmin/api/': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/upload/, '/upload'), // 可选：重写路径
        },
      },
    },
    base: "/kubeadmin/",
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
