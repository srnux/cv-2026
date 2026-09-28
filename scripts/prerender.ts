/**
 * Prerender the single page at build time.
 *
 * The site is linked from CVs and applications, so an ATS parser or an LLM
 * screener that follows the link has to find real content in the HTML. Without
 * this step the deployed document is an empty <div id="root"> and every one of
 * them sees nothing.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle):
 * renders <App /> to a string and injects it into dist/index.html. The client
 * then hydrates that markup instead of creating it.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(ROOT, 'dist/index.html');
const serverEntry = resolve(ROOT, 'dist-ssr/entry-server.js');

const { render } = (await import(pathToFileURL(serverEntry).href)) as { render: (lang: 'en' | 'de') => string };
const appHtml = render('en');

const html = readFileSync(htmlPath, 'utf8');
const marker = '<div id="root"></div>';

if (!html.includes(marker)) {
  throw new Error(`Prerender failed: "${marker}" not found in dist/index.html`);
}

writeFileSync(htmlPath, html.replace(marker, `<div id="root">${appHtml}</div>`), 'utf8');
rmSync(resolve(ROOT, 'dist-ssr'), { recursive: true, force: true });

const kb = (Buffer.byteLength(appHtml) / 1024).toFixed(1);
console.log(`prerender: injected ${kb} kB of markup into dist/index.html`);
