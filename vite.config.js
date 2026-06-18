import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.VITE_OPENAI_API_KEY || ''
  const injection = `<script>window.VITE_OPENAI_API_KEY=${JSON.stringify(apiKey)};</script>`

  const injectEnvPlugin = {
    name: 'inject-env-into-static-html',

    // Dev: intercept the file as middleware
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.includes('marsdentherapy-webpage.html')) return next()
        const filePath = path.join(process.cwd(), 'marsdentherapy-webpage.html')
        let html = fs.readFileSync(filePath, 'utf-8')
        html = html.replace('</head>', injection + '</head>')
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      })
    },

    // Build: rewrite the copied static file in dist
    closeBundle() {
      const distFile = path.join(process.cwd(), 'dist', 'marsdentherapy-webpage.html')
      if (fs.existsSync(distFile)) {
        let html = fs.readFileSync(distFile, 'utf-8')
        html = html.replace('</head>', injection + '</head>')
        fs.writeFileSync(distFile, html)
      }
    }
  }

  return {
    plugins: [react(), injectEnvPlugin],
    server: {
      port: 3000,
      open: true
    }
  }
})
