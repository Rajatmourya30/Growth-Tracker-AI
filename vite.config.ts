import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This effectively replaces 'process.env.API_KEY' in your code with 'import.meta.env.VITE_API_KEY'
    // This allows you to keep using process.env.API_KEY in your code (as per guidelines)
    // while making it work in the browser with Cloudflare environment variables.
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  }
});