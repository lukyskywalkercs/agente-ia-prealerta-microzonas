import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'

const targets = []

if (fs.existsSync('public/data/agent_ui.json')) {
  targets.push({ src: 'public/data/agent_ui.json', dest: 'data' })
}
if (fs.existsSync('public/data/alerta_almassora.json')) {
  targets.push({ src: 'public/data/alerta_almassora.json', dest: 'data' })
}

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({ targets })
  ]
})