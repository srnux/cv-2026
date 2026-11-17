/**
 * Render every article in content/articles/ into static pages in both site
 * languages, and emit a dev.to-ready copy of the English source.
 *
 *   pnpm articles
 *
 * Sources: <slug>.md is the English article and is required. <slug>.de.md is
 * an optional German translation of it. For every slug the script writes
 *
 *   public/writing/<slug>/index.html      English
 *   public/de/writing/<slug>/index.html   German, or, without a translation,
 *                                         the English body in German chrome
 *   content/devto/<slug>.md               from the English source only
 *
 * so every English article has a German route. That matters because a
 * visitor who chose German is redirected to /de + path, and that must never
 * be a 404. A fallback page's canonical points at the English article and it
 * declares no hreflang pair: its content is not a translation.
 *
 * luka-engels.de is canonical; the dev.to copy carries a canonical_url
 * pointing back here, so the cross-post credits this domain rather than
 * competing with it.
 *
 * The pages are plain static HTML in public/, the same shape as the legal pages
 * and the printable CVs, so they need no router and are readable by a crawler
 * without executing any JavaScript. That is the whole point: this site is linked
 * from job applications, and an ATS parser or an LLM screener has to be able to
 * read it.
 *
 * The generator also writes src/content/articles.json, { en: [...], de: [...] },
 * which the Writing section on the home page imports, and public/sitemap.xml,
 * because this is the script that knows the article list.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { HTML_LANG, LANGS, type Lang } from '../src/i18n/lang';
import { languageScript, storeOnClick } from '../src/i18n/inline';
import { writingPath } from '../src/i18n/paths';
import { buildSitemap, pair, type SitemapEntry } from './sitemap';

const SITE = 'https://luka-engels.de';
const AUTHOR = 'Luka Engels';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = resolve(ROOT, 'content/articles');
const PUBLIC = resolve(ROOT, 'public');
const DEVTO_DIR = resolve(ROOT, 'content/devto');
const FONT_DIR = resolve(ROOT, 'public/fonts');
const LISTING = resolve(ROOT, 'src/content/articles.json');
const SITEMAP = resolve(ROOT, 'public/sitemap.xml');

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
  /** Public path, e.g. /images/writing/<slug>-cover.jpg. Must exist under public/. */
  coverImage?: string;
  /** Canonical URL of the dev.to cross-post, once it is live. */
  devtoUrl?: string;
  /** Source repository the article is about, linked from the home page listing. */
  repoUrl?: string;
  /** dev.to series name; dev.to links every post that carries the same one. */
  series?: string;
};

/**
 * One source, two targets. dev.to runs no custom JavaScript and strips most
 * raw HTML, so an article can mark a block for one target only:
 *
 *   <!-- site-only -->  interactive embed, <picture>, <script>  <!-- /site-only -->
 *   <!-- devto-only --> static Markdown stand-in                <!-- /devto-only -->
 *
 * The block for the other target is dropped and the markers themselves never ship.
 */
type Target = 'site' | 'devto';
const TARGET_BLOCK = /<!-- (site|devto)-only -->\r?\n?([\s\S]*?)<!-- \/\1-only -->\r?\n?/g;

function forTarget(content: string, target: Target): string {
  const out = content.replace(TARGET_BLOCK, (_m, which: Target, inner: string) => (which === target ? inner : ''));
  if (/<!-- \/?(site|devto)-only -->/.test(out)) {
    throw new Error('unbalanced <!-- site-only --> / <!-- devto-only --> marker');
  }
  return out;
}

/**
 * Keep in step with the Article type in src/components/Writing.tsx.
 * `lang` is the language of the article body, which on a German fallback page
 * is English.
 */
type ArticleMeta = {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  tags: string[];
  readingMinutes: number;
  url: string;
  coverImage?: string;
  devtoUrl?: string;
  repoUrl?: string;
};

/** Page chrome per page language: everything around the article body. */
const CHROME: Record<Lang, {
  dateLocale: string;
  home: string;
  writing: string;
  contact: string;
  minRead: (minutes: number) => string;
  byline: string;
  devto: (url: string) => string;
  backToSite: string;
  moreWriting: string;
  getInTouch: string;
  switchLanguage: string;
  englishOnly: string;
  /** The index page at /writing/ and /de/writing/. */
  indexTitle: string;
  indexIntro: string;
  indexDescription: string;
  read: string;
  repo: string;
  /** Appended to the date line of an index card whose article exists only in English. */
  englishOnlyMark: string;
}> = {
  en: {
    dateLocale: 'en-GB',
    home: '/',
    writing: writingPath('en'),
    contact: '/#contact',
    minRead: n => `${n} min read`,
    byline: `Written by ${AUTHOR}, Lead Software Engineer in Hamburg.`,
    devto: url => `Also published <a href="${url}" target="_blank" rel="noopener noreferrer">on dev.to</a>.`,
    backToSite: 'Back to the site',
    moreWriting: 'More articles',
    getInTouch: 'Get in touch',
    switchLanguage: 'Language',
    englishOnly: '',
    indexTitle: 'Articles',
    indexIntro: 'On technology, work, and the ideas shaping both.',
    indexDescription: `Articles by ${AUTHOR} on agentic AI, LLM platforms and cloud architecture.`,
    read: 'Read the article',
    repo: 'GitHub Repo',
    englishOnlyMark: '',
  },
  de: {
    dateLocale: 'de-DE',
    home: '/de/',
    writing: writingPath('de'),
    contact: '/de/#contact',
    minRead: n => `${n} Min. Lesezeit`,
    byline: `Geschrieben von ${AUTHOR}, Lead Software Engineer in Hamburg.`,
    devto: url => `Auch erschienen <a href="${url}" target="_blank" rel="noopener noreferrer">auf dev.to</a>.`,
    backToSite: 'Zurück zur Website',
    moreWriting: 'Weitere Artikel',
    getInTouch: 'Kontakt aufnehmen',
    switchLanguage: 'Sprache',
    englishOnly: 'Diesen Artikel gibt es bisher nur auf Englisch.',
    indexTitle: 'Artikel',
    indexIntro: 'Über Technologie, Arbeit und die Ideen, die beide prägen.',
    indexDescription: `Artikel von ${AUTHOR} über agentische KI, LLM-Plattformen und Cloud-Architektur.`,
    read: 'Artikel lesen',
    repo: 'GitHub-Repo',
    englishOnlyMark: 'Artikel auf Englisch',
  },
};

const articleUrl = (lang: Lang, slug: string): string => `${writingPath(lang)}${slug}/`;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const formatDate = (iso: string, lang: Lang): string =>
  new Date(iso).toLocaleDateString(CHROME[lang].dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

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
  // Body images sit below the fold; the cover is the only one worth loading eagerly.
  html = html.replace(/<img /g, '<img loading="lazy" ');
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
  .wrap { max-width: 56rem; margin: 0 auto; padding: 3rem 1.25rem 6rem; }

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
  .cover { display: block; width: 100%; height: auto; margin: 0 0 2.5rem; border: 1px solid #262626; }
  p img { display: block; max-width: 100%; height: auto; margin: 2rem 0; border: 1px solid #262626; }
  figure { margin: 2.25rem 0; }
  figure img { display: block; width: 100%; height: auto; border: 1px solid #262626; }
  figcaption { font-size: 0.875rem; color: #9a9a9a; margin-top: 0.75rem; }
  .toc { border: 1px solid #262626; padding: 1rem 1.25rem; margin: 0 0 2.5rem; font-size: 0.9375rem; }
  .toc ol { margin: 0; }
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

  /* GitHub gist embeds ship a light theme; these rules restyle them to match the code panels above.
     GitHub's stylesheet is injected after this one, hence the !important. */
  .gist-embed { margin: 0 0 1.5rem; }
  .gist-embed .gist .gist-file { border: 1px solid #262626 !important; border-radius: 0 !important; margin: 0 !important; background: #0c0c0c !important; }
  .gist-embed .gist .gist-data { background: #0c0c0c !important; border-bottom: 1px solid #262626 !important; }
  .gist-embed .gist .blob-wrapper, .gist-embed .gist .highlight, .gist-embed .gist table, .gist-embed .gist tr, .gist-embed .gist td { background: #0c0c0c !important; border: 0 !important; }
  .gist-embed .gist .blob-code, .gist-embed .gist .blob-code-inner {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace !important;
    font-size: 0.8125rem !important; line-height: 1.55 !important; color: #d6d6d6 !important; background: #0c0c0c !important;
  }
  .gist-embed .gist .blob-num { color: #4d4d4d !important; background: #0c0c0c !important; border: 0 !important; font-size: 0.75rem !important; }
  .gist-embed .gist .pl-c { color: #6f6f6f !important; font-style: italic; }
  .gist-embed .gist .pl-k, .gist-embed .gist .pl-s1 .pl-k { color: #ffffff !important; font-weight: 600; }
  .gist-embed .gist .pl-s, .gist-embed .gist .pl-pds, .gist-embed .gist .pl-s .pl-pse { color: #d6b25a !important; }
  .gist-embed .gist .pl-en, .gist-embed .gist .pl-smi, .gist-embed .gist .pl-v, .gist-embed .gist .pl-c1, .gist-embed .gist .pl-e { color: #bdbdbd !important; }
  .gist-embed .gist .pl-c1 { color: #e2e2e2 !important; }
  .gist-embed .gist .gist-meta {
    background: #131313 !important; color: #9a9a9a !important; border: 0 !important;
    font-family: Inter, sans-serif !important; font-size: 0.8125rem !important; padding: 0.6rem 1.15rem !important;
  }
  .gist-embed .gist .gist-meta a { color: #cfcfcf !important; }
  @media (max-width: 640px) { .gist-embed .gist .blob-code, .gist-embed .gist .blob-code-inner { font-size: 0.75rem !important; } }

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

/** The top bar with the back link and the language switcher, and the English-only note. */
const I18N_STYLES = `
  .topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 3rem; }
  .topbar .back { margin-bottom: 0; }
  .lang { font-family: 'Space Grotesk', sans-serif; font-size: 0.8125rem; letter-spacing: 0.08em; color: #9a9a9a; }
  .lang a { text-decoration: none; color: #cfcfcf; }
  .lang a:hover { text-decoration: underline; }
  .lang a[aria-current] { color: #fff; text-decoration: underline; }
  .note {
    border: 1px solid #3a3a3a; padding: 0.75rem 1rem; margin: 0 0 2.5rem;
    font-size: 0.9375rem; color: #bdbdbd;
  }
`;

/** EN / DE links between the two language versions of a page; a click stores the choice. */
function languageSwitcher(pageLang: Lang, urls: Record<Lang, string>): string {
  return LANGS.map(l =>
    l === pageLang
      ? `<a href="${urls[l]}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}" aria-current="true">${l.toUpperCase()}</a>`
      : `<a href="${urls[l]}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}" onclick="${storeOnClick(l)}">${l.toUpperCase()}</a>`,
  ).join(' / ');
}

type PageOptions = {
  /** Language of the page chrome and of <html lang>. */
  pageLang: Lang;
  canonical: string;
  /** Both language versions, only when the article is really translated. */
  alternates: { lang: Lang; url: string }[];
  /** URL of this article in each language, for the switcher. */
  urls: Record<Lang, string>;
};

function page(meta: ArticleMeta, bodyHtml: string, opts: PageOptions): string {
  const t = CHROME[opts.pageLang];
  const url = `${SITE}${meta.url}`;
  const coverUrl = meta.coverImage ? `${SITE}${meta.coverImage}` : undefined;
  const fallback = meta.lang !== opts.pageLang;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    inLanguage: HTML_LANG[meta.lang],
    keywords: meta.tags.join(', '),
    wordCount: meta.readingMinutes * 220,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.canonical },
    ...(coverUrl ? { image: [coverUrl] } : {}),
    author: { '@type': 'Person', name: AUTHOR, url: `${SITE}${t.home}` },
    publisher: { '@type': 'Person', name: AUTHOR, url: `${SITE}${t.home}` },
  };
  const hreflang = opts.alternates.length
    ? [
        ...opts.alternates.map(a => `<link rel="alternate" hreflang="${HTML_LANG[a.lang]}" href="${SITE}${a.url}">`),
        `<link rel="alternate" hreflang="x-default" href="${SITE}${opts.urls.en}">`,
      ].join('\n')
    : '';
  const switcher = languageSwitcher(opts.pageLang, opts.urls);
  const bodyLang = fallback ? ` lang="${HTML_LANG[meta.lang]}"` : '';

  return `<!doctype html>
<html lang="${HTML_LANG[opts.pageLang]}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(meta.title)} — ${AUTHOR}</title>
<meta name="description" content="${escapeHtml(meta.description)}">
<meta name="author" content="${AUTHOR}">
<link rel="canonical" href="${opts.canonical}">
${hreflang}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#000000">

<meta property="og:type" content="article">
<meta property="og:site_name" content="${AUTHOR}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.description)}">
<meta property="og:locale" content="${HTML_LANG[opts.pageLang].replace('-', '_')}">
<meta property="article:published_time" content="${meta.date}">
<meta property="article:author" content="${AUTHOR}">
${coverUrl ? `<meta property="og:image" content="${coverUrl}">
<meta property="og:image:alt" content="${escapeHtml(meta.title)}">` : ''}
${meta.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join('\n')}

<meta name="twitter:card" content="${coverUrl ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.description)}">
${coverUrl ? `<meta name="twitter:image" content="${coverUrl}">` : ''}

<!-- Generated by scripts/build-articles.ts from content/articles/${meta.slug}${meta.lang === 'de' ? '.de' : ''}.md. Do not hand-edit. -->
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c')}
</script>
<script>${languageScript}</script>
<style>${STYLES}${I18N_STYLES}</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <a class="back" href="${t.writing}">${AUTHOR}</a>
    <nav class="lang" aria-label="${t.switchLanguage}">${switcher}</nav>
  </div>
${fallback ? `  <p class="note">${t.englishOnly}</p>\n` : ''}
  <article${bodyLang}>
    <h1>${escapeHtml(meta.title)}</h1>
    <p class="meta">${meta.displayDate} · ${t.minRead(meta.readingMinutes)} · ${AUTHOR}</p>
    <p class="lede">${escapeHtml(meta.description)}</p>
    <ul class="tags">${meta.tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
${meta.coverImage ? `    <img class="cover" src="${meta.coverImage}" alt="" width="1200" height="500" loading="eager">` : ''}

${bodyHtml}
  </article>

  <footer>
    <p>${t.byline}
    ${meta.devtoUrl ? t.devto(meta.devtoUrl) : ''}</p>
    <p><a href="${t.home}">${t.backToSite}</a> · <a href="${t.writing}">${t.moreWriting}</a> · <a href="${t.contact}">${t.getInTouch}</a></p>
  </footer>
</div>
</body>
</html>
`;
}

/** The article cards on the index page. Overrides the article-body heading and list spacing from STYLES. */
const INDEX_STYLES = `
  .cards { list-style: none; margin: 0; padding: 0; }
  .cards > li { border-top: 1px solid #fff; padding-top: 2rem; margin: 0 0 3rem; }
  .card-link { display: block; text-decoration: none; color: inherit; }
  .card-link .cover { margin: 0 0 1.5rem; }
  .card-link h2 { margin: 0 0 0.75rem; }
  .card-link:hover h2 { text-decoration: underline; }
  .card-link .lede { margin: 0 0 1.25rem; }
  .cards .tags { margin: 0 0 1.25rem; padding: 0; }
  .cards .tags li { margin: 0; }
  .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0; }
  .button {
    display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.8125rem; letter-spacing: 0.08em; border: 1px solid #fff; padding: 0.4rem 1rem; text-decoration: none;
  }
  .button.secondary { border-color: #5a5a5a; color: #cfcfcf; }
  .button:hover { background: #fff; color: #000; border-color: #fff; }
`;

/**
 * The index page at /writing/ (or /de/writing/): every article as a card, newest first.
 * The card is not one big link: the buttons are real anchors, and an anchor inside an
 * anchor is invalid HTML. Cover, date, title and summary share one link; tags and
 * buttons sit beside it.
 */
function indexPage(lang: Lang, articles: ArticleMeta[]): string {
  const t = CHROME[lang];
  const urls: Record<Lang, string> = { en: writingPath('en'), de: writingPath('de') };
  const url = `${SITE}${urls[lang]}`;
  const title = `${t.indexTitle} — ${AUTHOR}`;
  const cards = articles
    .map(a => {
      const foreign = a.lang !== lang ? ` lang="${HTML_LANG[a.lang]}"` : '';
      const mark = a.lang !== lang && t.englishOnlyMark ? ` · ${t.englishOnlyMark}` : '';
      const cover = a.coverImage
        ? `        <img class="cover" src="${a.coverImage}" alt="" width="1200" height="500" loading="lazy">\n`
        : '';
      const repo = a.repoUrl
        ? ` <a class="button secondary" href="${escapeHtml(a.repoUrl)}" target="_blank" rel="noopener noreferrer">${t.repo}</a>`
        : '';
      return [
        '    <li>',
        `      <a class="card-link" href="${a.url}">`,
        `${cover}        <p class="meta">${a.displayDate} · ${t.minRead(a.readingMinutes)}${mark}</p>`,
        `        <h2${foreign}>${escapeHtml(a.title)}</h2>`,
        `        <p class="lede"${foreign}>${escapeHtml(a.description)}</p>`,
        '      </a>',
        `      <ul class="tags">${a.tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`,
        `      <p class="actions"><a class="button" href="${a.url}">${t.read}</a>${repo}</p>`,
        '    </li>',
      ].join('\n');
    })
    .join('\n');

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${escapeHtml(t.indexDescription)}">
<meta name="author" content="${AUTHOR}">
<link rel="canonical" href="${url}">
${LANGS.map(l => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE}${urls[l]}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE}${urls.en}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#000000">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${AUTHOR}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${escapeHtml(t.indexDescription)}">
<meta property="og:locale" content="${HTML_LANG[lang].replace('-', '_')}">

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${escapeHtml(t.indexDescription)}">

<!-- Generated by scripts/build-articles.ts from content/articles/. Do not hand-edit. -->
<script>${languageScript}</script>
<style>${STYLES}${I18N_STYLES}${INDEX_STYLES}</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <a class="back" href="${t.home}">${AUTHOR}</a>
    <nav class="lang" aria-label="${t.switchLanguage}">${languageSwitcher(lang, urls)}</nav>
  </div>
  <h1>${t.indexTitle}</h1>
  <p class="lede">${t.indexIntro}</p>
  <ul class="cards">
${cards}
  </ul>

  <footer>
    <p>${t.byline}</p>
    <p><a href="${t.home}">${t.backToSite}</a> · <a href="${t.contact}">${t.getInTouch}</a></p>
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
    `cover_image: ${meta.coverImage ? SITE + meta.coverImage : ''}`,
    `canonical_url: ${SITE}${meta.url}`,
    ...(fm.series ? [`series: ${JSON.stringify(fm.series)}`] : []),
    '---',
    '',
    // Root-relative images and links would resolve against dev.to, so point them back here.
    body.trimStart().replace(/\]\(\//g, `](${SITE}/`),
  ].join('\n');
}

type Source = { file: string; fm: Frontmatter; content: string };

function readSource(file: string, required: readonly (keyof Frontmatter)[]): Source {
  const { data, content } = matter(readFileSync(resolve(SOURCE_DIR, file), 'utf8'));
  const fm = data as Frontmatter;
  for (const key of required) {
    if (!fm[key]) throw new Error(`${file}: frontmatter is missing "${key}"`);
  }
  return { file, fm, content };
}

function metaFor(slug: string, source: Source, bodyLang: Lang, pageLang: Lang): ArticleMeta {
  const { file, fm, content } = source;
  const date = new Date(fm.date).toISOString().slice(0, 10);
  const words = forTarget(content, 'site').split(/\s+/).filter(Boolean).length;
  const meta: ArticleMeta = {
    slug,
    lang: bodyLang,
    title: fm.title,
    description: fm.description,
    date,
    displayDate: formatDate(date, pageLang),
    tags: fm.tags ?? [],
    readingMinutes: Math.max(1, Math.round(words / 220)),
    url: articleUrl(pageLang, slug),
    coverImage: fm.coverImage,
    devtoUrl: fm.devtoUrl,
    repoUrl: fm.repoUrl,
  };

  // A cover declared but not present would ship a broken hero image and, worse,
  // a broken og:image that every share preview would fall back from silently.
  if (meta.coverImage) {
    const onDisk = resolve(PUBLIC, `.${meta.coverImage}`);
    if (!existsSync(onDisk)) {
      throw new Error(`${file}: coverImage "${meta.coverImage}" not found at ${relative(ROOT, onDisk)}`);
    }
  }
  // The same goes for images in the body, which would otherwise ship as broken icons.
  // Raw HTML too: a <picture>, a figure linking the full-size file, or an embed's script.
  const assets = [
    ...content.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g),
    ...content.matchAll(/\b(?:src|srcset|href)="(\/[^"\s#?]+\.(?:png|jpe?g|gif|svg|webp|js))"/g),
  ];
  for (const [, src] of assets) {
    const onDisk = resolve(PUBLIC, `.${src}`);
    if (!existsSync(onDisk)) {
      throw new Error(`${file}: image "${src}" not found at ${relative(ROOT, onDisk)}`);
    }
  }
  return meta;
}

function writePage(meta: ArticleMeta, source: Source, opts: PageOptions): void {
  const bodyHtml = decorate(marked.parse(forTarget(source.content, 'site'), { async: false }) as string);
  const outDir = resolve(PUBLIC, `.${meta.url}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), page(meta, bodyHtml, opts), 'utf8');
}

// ---------------------------------------------------------------------------

mkdirSync(DEVTO_DIR, { recursive: true });
mkdirSync(FONT_DIR, { recursive: true });
mkdirSync(dirname(LISTING), { recursive: true });

for (const [from, to] of FONTS) {
  copyFileSync(resolve(ROOT, 'node_modules', from), resolve(FONT_DIR, to));
}

const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md')).sort();
const englishSlugs = files.filter(f => !f.endsWith('.de.md')).map(f => f.slice(0, -'.md'.length));
const germanSlugs = new Set(files.filter(f => f.endsWith('.de.md')).map(f => f.slice(0, -'.de.md'.length)));

if (englishSlugs.length === 0) {
  throw new Error(`No articles found in ${relative(ROOT, SOURCE_DIR)}`);
}
// The slug is shared, so a translation of an article that does not exist
// would publish a German page with nothing to be the translation of.
for (const slug of germanSlugs) {
  if (!englishSlugs.includes(slug)) {
    throw new Error(`content/articles/${slug}.de.md has no English original content/articles/${slug}.md`);
  }
}

const listing: Record<Lang, ArticleMeta[]> = { en: [], de: [] };
const sitemapArticles: SitemapEntry[] = [];

for (const slug of englishSlugs) {
  const en = readSource(`${slug}.md`, ['title', 'description', 'date']);
  const urls: Record<Lang, string> = { en: articleUrl('en', slug), de: articleUrl('de', slug) };
  const enMeta = metaFor(slug, en, 'en', 'en');

  let deMeta: ArticleMeta;
  let deSource: Source;
  const translated = germanSlugs.has(slug);

  if (translated) {
    const de = readSource(`${slug}.de.md`, ['title', 'description']);
    // Date, cover, tags and repo are facts about the article, not wording, so a
    // translation may leave them out and inherit them from the English file.
    // The dev.to link is not inherited: the cross-post is the English text.
    deSource = {
      ...de,
      fm: {
        ...de.fm,
        date: de.fm.date ?? en.fm.date,
        tags: de.fm.tags ?? en.fm.tags,
        coverImage: de.fm.coverImage ?? en.fm.coverImage,
        repoUrl: de.fm.repoUrl ?? en.fm.repoUrl,
      },
    };
    deMeta = metaFor(slug, deSource, 'de', 'de');
  } else {
    deSource = en;
    deMeta = metaFor(slug, en, 'en', 'de');
  }

  const alternates = translated
    ? [
        { lang: 'en' as const, url: urls.en },
        { lang: 'de' as const, url: urls.de },
      ]
    : [];

  writePage(enMeta, en, { pageLang: 'en', canonical: `${SITE}${urls.en}`, alternates, urls });
  writePage(deMeta, deSource, {
    pageLang: 'de',
    canonical: `${SITE}${translated ? urls.de : urls.en}`,
    alternates,
    urls,
  });
  writeFileSync(resolve(DEVTO_DIR, `${slug}.md`), devtoMarkdown(enMeta, en.fm, forTarget(en.content, 'devto')), 'utf8');

  listing.en.push(enMeta);
  listing.de.push(deMeta);

  if (translated) {
    sitemapArticles.push(
      ...pair(`${SITE}${urls.en}`, `${SITE}${urls.de}`, { lastmod: enMeta.date, changefreq: 'yearly', priority: '0.9' }),
    );
  } else {
    // The fallback page's canonical is the English one, so only that is listed.
    sitemapArticles.push({ loc: `${SITE}${urls.en}`, lastmod: enMeta.date, changefreq: 'yearly', priority: '0.9' });
  }

  console.log(
    `wrote public${urls.en}index.html, public${urls.de}index.html (${translated ? 'German translation' : 'English body, German chrome'}) ` +
      `and content/devto/${slug}.md (${enMeta.readingMinutes} min read)`,
  );

  // dev.to accepts at most four tags and silently drops the rest on import.
  // The site page is happy with more, so this is a warning, not a failure.
  if (enMeta.tags.length > 4) {
    console.warn(
      `  warning: ${enMeta.tags.length} tags, but dev.to accepts 4. ` +
        `It will keep the first four: ${enMeta.tags.slice(0, 4).join(', ')}`,
    );
  }
}

for (const lang of LANGS) listing[lang].sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(LISTING, `${JSON.stringify(listing, null, 2)}\n`, 'utf8');
console.log(`wrote src/content/articles.json (${englishSlugs.length} article${englishSlugs.length === 1 ? '' : 's'} per language)`);

for (const lang of LANGS) {
  const outDir = resolve(PUBLIC, `.${writingPath(lang)}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), indexPage(lang, listing[lang]), 'utf8');
  console.log(`wrote public${writingPath(lang)}index.html (index of ${listing[lang].length} articles)`);
}

const sitemap = buildSitemap([
  ...pair(`${SITE}/`, `${SITE}/de/`, { changefreq: 'monthly', priority: '1.0' }),
  ...pair(`${SITE}/cv-luka-engels-en.html`, `${SITE}/cv-luka-engels-de.html`, { changefreq: 'monthly', priority: '0.8' }),
  ...pair(`${SITE}${writingPath('en')}`, `${SITE}${writingPath('de')}`, {
    lastmod: listing.en[0].date,
    changefreq: 'monthly',
    priority: '0.9',
  }),
  ...sitemapArticles,
  ...pair(`${SITE}/legal-notice.html`, `${SITE}/impressum.html`, { changefreq: 'yearly', priority: '0.1' }),
  ...pair(`${SITE}/privacy.html`, `${SITE}/datenschutz.html`, { changefreq: 'yearly', priority: '0.1' }),
]);
writeFileSync(SITEMAP, sitemap, 'utf8');
console.log('wrote public/sitemap.xml');
