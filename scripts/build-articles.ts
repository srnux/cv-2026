/**
 * Render every article in content/articles/ into a static page under
 * public/writing/<slug>/index.html, and emit a dev.to-ready copy of the same
 * source next to it.
 *
 *   pnpm articles
 *
 * One source, two outputs. luka-engels.de is canonical; the dev.to copy carries
 * a canonical_url pointing back here, so the cross-post credits this domain
 * rather than competing with it.
 *
 * The pages are plain static HTML in public/, the same shape as the legal pages
 * and the printable CVs, so they need no router and are readable by a crawler
 * without executing any JavaScript. That is the whole point: this site is linked
 * from job applications, and an ATS parser or an LLM screener has to be able to
 * read it.
 *
 * The generator also writes src/content/articles.json, which the Writing section
 * on the home page imports. Adding an article is therefore: drop a .md file in
 * content/articles/, run `pnpm articles`, and both the page and the listing
 * update together.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename, relative } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SITE = 'https://luka-engels.de';
const AUTHOR = 'Luka Engels';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = resolve(ROOT, 'content/articles');
const PAGE_DIR = resolve(ROOT, 'public/writing');
const DEVTO_DIR = resolve(ROOT, 'content/devto');
const FONT_DIR = resolve(ROOT, 'public/fonts');
const LISTING = resolve(ROOT, 'src/content/articles.json');

/** Self-hosted so the static pages match the app's typography without calling Google. */
const FONTS = [
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
  ['@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2', 'space-grotesk-500.woff2'],
  ['@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2', 'space-grotesk-700.woff2'],
];

type Frontmatter = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  devtoPublished?: boolean;
  coverImage?: string;
};

type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  tags: string[];
  readingMinutes: number;
  url: string;
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Post-process marked's output rather than overriding its renderer: renderer
 * signatures have changed several times across marked majors, string surgery
 * on the result has not.
 */
function decorate(html: string): string {
  // Anchorable headings, so sections can be linked to directly.
  html = html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_m, tag: string, inner: string) => {
    const id = slugify(inner);
    return `<${tag} id="${id}"><a class="anchor" href="#${id}">${inner}</a></${tag}>`;
  });
  // Tables scroll horizontally instead of forcing the page wide on a phone.
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  // External links open in a new tab and do not leak the referrer chain.
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  return html;
}

const STYLES = `
  :root { color-scheme: dark; }
  @font-face { font-family: Inter; src: url(/fonts/inter-400.woff2) format('woff2'); font-weight: 400; font-display: swap; }
  @font-face { font-family: Inter; src: url(/fonts/inter-600.woff2) format('woff2'); font-weight: 600; font-display: swap; }
  @font-face { font-family: 'Space Grotesk'; src: url(/fonts/space-grotesk-500.woff2) format('woff2'); font-weight: 500; font-display: swap; }
  @font-face { font-family: 'Space Grotesk'; src: url(/fonts/space-grotesk-700.woff2) format('woff2'); font-weight: 700; font-display: swap; }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #000;
    color: #e8e8e8;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-weight: 400;
    line-height: 1.75;
    font-size: 1.0625rem;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 48rem; margin: 0 auto; padding: 3rem 1.25rem 6rem; }

  a { color: #fff; text-underline-offset: 3px; }
  a:hover { text-decoration: none; }

  .back {
    display: inline-block; margin-bottom: 3rem; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.8125rem; letter-spacing: 0.08em; text-transform: uppercase;
    border: 1px solid #fff; padding: 0.4rem 1rem; text-decoration: none;
  }
  .back:hover { background: #fff; color: #000; }

  h1 {
    font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: clamp(2rem, 5vw, 2.75rem);
    line-height: 1.15; letter-spacing: -0.01em; margin: 0 0 1rem; color: #fff;
  }
  h2, h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 500; color: #fff; line-height: 1.25; }
  h2 { font-size: 1.625rem; margin: 3.5rem 0 1rem; }
  h3 { font-size: 1.25rem; margin: 2.5rem 0 0.75rem; }
  .anchor { color: inherit; text-decoration: none; }
  .anchor:hover { text-decoration: underline; }

  .meta {
    font-family: 'Space Grotesk', sans-serif; font-size: 0.875rem; color: #9a9a9a;
    letter-spacing: 0.02em; margin: 0 0 1.25rem;
  }
  .lede { font-size: 1.1875rem; color: #bdbdbd; margin: 0 0 2rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 3rem; padding: 0; list-style: none; }
  .tags li {
    font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; letter-spacing: 0.06em;
    text-transform: uppercase; border: 1px solid #3a3a3a; color: #b5b5b5; padding: 0.2rem 0.6rem;
  }

  p { margin: 0 0 1.35rem; }
  strong { color: #fff; font-weight: 600; }
  em { color: #d8d8d8; }
  ul, ol { margin: 0 0 1.35rem; padding-left: 1.3rem; }
  li { margin-bottom: 0.4rem; }
  hr { border: 0; border-top: 1px solid #262626; margin: 3rem 0; }

  blockquote {
    margin: 2rem 0; padding: 1rem 0 1rem 1.5rem; border-left: 2px solid #fff;
    font-family: 'Space Grotesk', sans-serif; font-size: 1.1875rem; line-height: 1.5; color: #fff;
  }
  blockquote p { margin: 0; }

  code {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.875em; background: #161616; border: 1px solid #262626;
    padding: 0.1em 0.35em; border-radius: 2px; color: #e2e2e2;
  }
  pre {
    background: #0c0c0c; border: 1px solid #262626; padding: 1rem 1.15rem;
    overflow-x: auto; margin: 0 0 1.5rem; line-height: 1.55;
  }
  pre code {
    background: none; border: 0; padding: 0; font-size: 0.8125rem;
    color: #d6d6d6; white-space: pre;
  }

  .table-wrap { overflow-x: auto; margin: 0 0 1.75rem; }
  table { border-collapse: collapse; width: 100%; font-size: 0.9375rem; }
  th, td { border: 1px solid #2a2a2a; padding: 0.55rem 0.8rem; text-align: left; vertical-align: top; }
  th { font-family: 'Space Grotesk', sans-serif; font-weight: 500; color: #fff; background: #131313; white-space: nowrap; }
  td code, th code { white-space: nowrap; }

  footer {
    border-top: 1px solid #262626; margin-top: 4.5rem; padding-top: 1.75rem;
    font-size: 0.9375rem; color: #9a9a9a;
  }
  footer a { color: #cfcfcf; }

  @media (max-width: 640px) {
    .wrap { padding: 2rem 1rem 4rem; }
    body { font-size: 1rem; }
    pre code { font-size: 0.75rem; }
  }
`;

function page(meta: ArticleMeta, bodyHtml: string, devtoUrl?: string): string {
  const canonical = `${SITE}${meta.url}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    inLanguage: 'en',
    keywords: meta.tags.join(', '),
    wordCount: meta.readingMinutes * 220,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Person', name: AUTHOR, url: `${SITE}/` },
    publisher: { '@type': 'Person', name: AUTHOR, url: `${SITE}/` },
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(meta.title)} — ${AUTHOR}</title>
<meta name="description" content="${escapeHtml(meta.description)}">
<meta name="author" content="${AUTHOR}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#000000">

<meta property="og:type" content="article">
<meta property="og:site_name" content="${AUTHOR}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.description)}">
<meta property="article:published_time" content="${meta.date}">
<meta property="article:author" content="${AUTHOR}">
${meta.tags.map(t => `<meta property="article:tag" content="${escapeHtml(t)}">`).join('\n')}

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.description)}">

<!-- Generated by scripts/build-articles.ts from content/articles/${meta.slug}.md. Do not hand-edit. -->
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
<style>${STYLES}</style>
</head>
<body>
<div class="wrap">
  <a class="back" href="/#writing">Luka Engels</a>

  <article>
    <h1>${escapeHtml(meta.title)}</h1>
    <p class="meta">${meta.displayDate} · ${meta.readingMinutes} min read · ${AUTHOR}</p>
    <p class="lede">${escapeHtml(meta.description)}</p>
    <ul class="tags">${meta.tags.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>

${bodyHtml}
  </article>

  <footer>
    <p>Written by ${AUTHOR}, Lead Software Engineer in Hamburg.
    ${devtoUrl ? `Also published <a href="${devtoUrl}" target="_blank" rel="noopener noreferrer">on dev.to</a>.` : ''}</p>
    <p><a href="/">Back to the site</a> · <a href="/#writing">More writing</a> · <a href="/#contact">Get in touch</a></p>
  </footer>
</div>
</body>
</html>
`;
}

/** The dev.to copy: their frontmatter keys exactly, with canonical_url filled in. */
function devtoMarkdown(meta: ArticleMeta, fm: Frontmatter, body: string): string {
  return [
    '---',
    `title: ${JSON.stringify(meta.title)}`,
    `published: ${fm.devtoPublished === true}`,
    `description: ${JSON.stringify(meta.description)}`,
    `tags: ${meta.tags.join(', ')}`,
    `cover_image: ${fm.coverImage ?? ''}`,
    `canonical_url: ${SITE}${meta.url}`,
    '---',
    '',
    body.trimStart(),
  ].join('\n');
}

// ---------------------------------------------------------------------------

mkdirSync(PAGE_DIR, { recursive: true });
mkdirSync(DEVTO_DIR, { recursive: true });
mkdirSync(FONT_DIR, { recursive: true });
mkdirSync(dirname(LISTING), { recursive: true });

for (const [from, to] of FONTS) {
  copyFileSync(resolve(ROOT, 'node_modules', from), resolve(FONT_DIR, to));
}

const sources = readdirSync(SOURCE_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

if (sources.length === 0) {
  throw new Error(`No articles found in ${relative(ROOT, SOURCE_DIR)}`);
}

const listing: ArticleMeta[] = [];

for (const file of sources) {
  const slug = basename(file, '.md');
  const raw = readFileSync(resolve(SOURCE_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  for (const key of ['title', 'description', 'date'] as const) {
    if (!fm[key]) throw new Error(`${file}: frontmatter is missing "${key}"`);
  }

  const date = new Date(fm.date).toISOString().slice(0, 10);
  const words = content.split(/\s+/).filter(Boolean).length;

  const meta: ArticleMeta = {
    slug,
    title: fm.title,
    description: fm.description,
    date,
    displayDate: formatDate(date),
    tags: fm.tags ?? [],
    readingMinutes: Math.max(1, Math.round(words / 220)),
    url: `/writing/${slug}/`,
  };

  const bodyHtml = decorate(marked.parse(content, { async: false }) as string);

  const outDir = resolve(PAGE_DIR, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), page(meta, bodyHtml), 'utf8');
  writeFileSync(resolve(DEVTO_DIR, `${slug}.md`), devtoMarkdown(meta, fm, content), 'utf8');

  listing.push(meta);
  console.log(`wrote public/writing/${slug}/index.html and content/devto/${slug}.md (${meta.readingMinutes} min read)`);
}

listing.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(LISTING, `${JSON.stringify(listing, null, 2)}\n`, 'utf8');
console.log(`wrote src/content/articles.json (${listing.length} article${listing.length === 1 ? '' : 's'})`);
