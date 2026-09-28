/**
 * Prerender the home page at build time, once per language.
 *
 * The site is linked from CVs and applications, so an ATS parser or an LLM
 * screener that follows the link has to find real content in the HTML. Without
 * this step the deployed document is an empty <div id="root"> and every one of
 * them sees nothing. A German screener following the /de/ link has to find
 * German content, with a German title, description and canonical.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle). For
 * each language it takes the built dist/index.html as a template, swaps the
 * i18n head block for that language's head, sets <html lang>, renders <App />
 * into the root and writes dist/index.html (English) or dist/<lang>/index.html.
 * The client then hydrates that markup instead of creating it.
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

type Lang = 'en' | 'de';
type ServerEntry = {
  render: (lang: Lang) => string;
  renderHead: (lang: Lang) => string;
  HEAD_START: string;
  HEAD_END: string;
  LANGS: readonly Lang[];
  HTML_LANG: Record<Lang, string>;
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const templatePath = resolve(DIST, 'index.html');
const serverEntry = resolve(ROOT, 'dist-ssr/entry-server.js');

const entry = (await import(pathToFileURL(serverEntry).href)) as ServerEntry;
const template = readFileSync(templatePath, 'utf8');

/** Replace exactly one occurrence, or fail the build naming what was missing. */
function replaceOnce(html: string, needle: string, replacement: string, what: string): string {
  const at = html.indexOf(needle);
  if (at === -1) throw new Error(`Prerender failed: ${what} not found in dist/index.html`);
  return html.slice(0, at) + replacement + html.slice(at + needle.length);
}

for (const lang of entry.LANGS) {
  let html = template;

  const start = html.indexOf(entry.HEAD_START);
  const end = html.indexOf(entry.HEAD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Prerender failed: i18n head markers not found in dist/index.html`);
  }
  html = html.slice(0, start) + entry.renderHead(lang) + html.slice(end + entry.HEAD_END.length);

  html = replaceOnce(html, '<html lang="en">', `<html lang="${entry.HTML_LANG[lang]}">`, '<html lang="en">');

  const appHtml = entry.render(lang);
  html = replaceOnce(html, '<div id="root"></div>', `<div id="root">${appHtml}</div>`, '<div id="root"></div>');

  const out = lang === 'en' ? templatePath : resolve(DIST, lang, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');

  const kb = (Buffer.byteLength(appHtml) / 1024).toFixed(1);
  console.log(`prerender: injected ${kb} kB of ${lang} markup into ${relative(ROOT, out)}`);
}

rmSync(resolve(ROOT, 'dist-ssr'), { recursive: true, force: true });
