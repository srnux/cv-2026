/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = dirname(fileURLToPath(import.meta.url))

/**
 * Serve directory URLs from public/ in dev, the way a static host does.
 *
 * The generated article pages live at public/writing/<slug>/index.html and are
 * linked as /writing/<slug>/. `vite preview` and GitHub Pages both resolve that
 * directory index; the dev server does not, and instead hands the path to the
 * SPA fallback, which quietly returns the home page. The bug therefore shows up
 * only in dev, which is the worst place for it to hide.
 *
 * This middleware is installed directly rather than from a returned post hook,
 * so it runs before Vite's internal static and history-fallback middlewares and
 * can rewrite the URL while they can still act on it.
 */
function staticDirectoryIndex(): Plugin {
  return {
    name: 'static-directory-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? ''
        const [path, query] = url.split('?')
        if (path.endsWith('/') && path !== '/') {
          const candidate = resolve(ROOT, 'public', `.${path}index.html`)
          if (existsSync(candidate)) {
            req.url = `${path}index.html${query ? `?${query}` : ''}`
          }
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), staticDirectoryIndex()],
  test: {
    // `pnpm test` runs the unit tests in src/; `pnpm test:build` runs tests/ against dist/.
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
})
