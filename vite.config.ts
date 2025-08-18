import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    hmr: {
      port: 8081,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔴 Proxy error:', err.message, 'for', req.url);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
              error: 'Proxy Error', 
              message: err.message,
              details: 'API server não está respondendo'
            }));
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 API Request:', req.method, req.url);
            // Adicionar headers UTF-8
            proxyReq.setHeader('Accept', 'application/json; charset=utf-8');
            proxyReq.setHeader('Accept-Charset', 'utf-8');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ API Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/dso': {
        target: 'https://dso.childfundbrasil.org.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/dso/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 DSO Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 DSO Request:', req.method, req.url);
            // Adicionar headers UTF-8
            proxyReq.setHeader('Accept', 'application/json; charset=utf-8');
            proxyReq.setHeader('Accept-Charset', 'utf-8');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ DSO Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
