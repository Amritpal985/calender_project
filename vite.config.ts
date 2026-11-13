import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo is served from https://<user>.github.io/calender_project/
export default defineConfig({
  plugins: [react()],
  base: '/calender_project/',
})
