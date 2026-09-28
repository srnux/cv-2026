import { HTML_LANG, LANGS, type Lang } from './lang';
import { dictionaries } from './dictionaries';
import { homePath } from './paths';
import { languageScript } from './inline';

/**
 * The language-dependent part of the home page <head>, rendered from the same
 * dictionaries as the page body.
 *
 * index.html holds only the two markers. The Vite plugin in vite.config.ts
 * fills them with the English head (dev and build), and scripts/prerender.ts
 * replaces the block with the German one for dist/de/index.html. The markers
 * stay in the output so the prerender can find the block; if they ever go
 * missing it throws rather than shipping German content under an English head.
 */
export const HEAD_START = '<!--i18n-head-->';
export const HEAD_END = '<!--/i18n-head-->';

const SITE = 'https://luka-engels.de';
const IMAGE = `${SITE}/images/luka-web-bw.jpg`;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const KNOWS_ABOUT = [
  'Agentic AI',
  'AI Agents and Multi-Agent Systems',
  'Large Language Models',
  'Model Context Protocol',
  'Retrieval-Augmented Generation',
  'Prompt and Context Engineering',
  'Agno',
  'AI-assisted Software Development',
  'Software Architecture',
  'Cloud Architecture',
  'AWS',
  'Azure Kubernetes Service',
  'TypeScript',
  'Python',
  'Node.js',
  'NestJS',
  'Angular',
  'Nx Monorepos',
  'Microservices',
  'Domain-Driven Design',
  'Event-Driven Architecture',
  'Elasticsearch',
  'PostgreSQL',
  'CI/CD',
  'Technical Leadership',
  'Remote Engineering Teams',
];

function personJsonLd(lang: Lang): string {
  const m = dictionaries[lang].meta.jsonLd;
  const [croatian, english, italian, german] = m.languages;
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Luka Engels',
    givenName: 'Luka',
    familyName: 'Engels',
    jobTitle: m.jobTitle,
    description: m.description,
    email: 'luka.engels@outlook.de',
    image: IMAGE,
    address: { '@type': 'PostalAddress', addressLocality: 'Hamburg', addressCountry: 'DE' },
    nationality: m.nationality.map(name => ({ '@type': 'Country', name })),
    url: `${SITE}${homePath(lang)}`,
    sameAs: ['https://www.linkedin.com/in/lukaengels/', 'https://github.com/srnux'],
    worksFor: { '@type': 'Organization', name: 'Empro (Whise Group)' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Rijeka' },
    knowsLanguage: [
      { '@type': 'Language', name: croatian, alternateName: 'hr' },
      { '@type': 'Language', name: english, alternateName: 'en' },
      { '@type': 'Language', name: italian, alternateName: 'it' },
      { '@type': 'Language', name: german, alternateName: 'de' },
    ],
    knowsAbout: KNOWS_ABOUT,
    seeks: { '@type': 'Demand', name: m.seeks },
  };
  // "<" escaped so no string in the data can ever close the script element.
  return JSON.stringify(person, null, 2).replace(/</g, '\\u003c');
}

export function renderHead(lang: Lang): string {
  const m = dictionaries[lang].meta;
  const url = `${SITE}${homePath(lang)}`;
  const other = LANGS.filter(l => l !== lang);
  const alternates = LANGS.map(l => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE}${homePath(l)}">`);

  return [
    HEAD_START,
    `<title>${escapeHtml(m.title)}</title>`,
    `<meta name="description" content="${escapeHtml(m.description)}">`,
    `<link rel="canonical" href="${url}">`,
    ...alternates,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:site_name" content="Luka Engels">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${escapeHtml(m.ogTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(m.ogDescription)}">`,
    `<meta property="og:image" content="${IMAGE}">`,
    `<meta property="og:image:alt" content="${escapeHtml(m.imageAlt)}">`,
    `<meta property="og:locale" content="${m.ogLocale}">`,
    ...other.map(l => `<meta property="og:locale:alternate" content="${dictionaries[l].meta.ogLocale}">`),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(m.ogTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(m.ogDescription)}">`,
    `<meta name="twitter:image" content="${IMAGE}">`,
    `<script type="application/ld+json">\n${personJsonLd(lang)}\n</script>`,
    `<script>${languageScript}</script>`,
    HEAD_END,
  ].join('\n    ');
}
