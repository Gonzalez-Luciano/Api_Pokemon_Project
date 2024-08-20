import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite que Vite escuche en todas las interfaces de red
    port: 5173, // El puerto en el que Vite debe correr (puedes cambiarlo si es necesario)
  }
});