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

    // Dev: intercept requests for the HTML file and inject the key
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

    // Build: copy the file into dist/ with the key injected
    closeBundle() {
      const src = path.join(process.cwd(), 'marsdentherapy-webpage.html')
      const dest = path.join(process.cwd(), 'dist', 'marsdentherapy-webpage.html')
      if (fs.existsSync(src)) {
        let html = fs.readFileSync(src, 'utf-8')
        html = html.replace('</head>', injection + '</head>')
        fs.writeFileSync(dest, html)
        console.log('[inject-env] wrote dist/marsdentherapy-webpage.html with key injected')
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
