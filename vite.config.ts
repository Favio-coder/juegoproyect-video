import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [tailwindcss(), react(), basicSsl()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
})
