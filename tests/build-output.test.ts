/**
 * Checks the built site in dist/. Run after `pnpm build`:
 *
 *   pnpm build && pnpm test:build
 *
 * These are the properties a crawler, an ATS parser or a share preview relies
 * on, so they are asserted on the real output rather than on the components.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(import.meta.dirname, '..', 'dist');
const SITE = 'https://luka-engels.de';

const read = (path: string): string => {
  const file = resolve(DIST, path);
  if (!existsSync(file)) throw new Error(`${path} not found in dist/; run pnpm build first`);
  return readFileSync(file, 'utf8');
};

const rootOf = (html: string): string => {
  const start = html.indexOf('<div id="root">');
  const end = html.indexOf('</body>');
  return html.slice(start, end);
};

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

describe('English home page', () => {
  const html = read('index.html');

  it('is British English with its own canonical and a German alternate', () => {
    expect(html).toContain('<html lang="en-GB">');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="de-DE" href="${SITE}/de/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${SITE}/">`);
    expect(html).toContain('<meta property="og:locale" content="en_GB">');
    expect(html).toContain('<meta property="og:locale:alternate" content="de_DE">');
    expect(html).toContain('<title>Luka Engels — Lead Software Engineer, Agentic AI &amp; LLM Platforms</title>');
  });

  it('is prerendered in English', () => {
    const root = rootOf(html);
    expect(root).toContain('Professional Experience');
    expect(root).not.toContain('Beruflicher Werdegang');
  });

  it('carries the language script once and no offer bar markup', () => {
    expect(count(html, 'Diese Seite gibt es auch auf Deutsch.')).toBe(1);
    expect(rootOf(html)).not.toContain('lang-offer');
  });
});

describe('German home page', () => {
  const html = read('de/index.html');

  it('is German with its own canonical and an English alternate', () => {
    expect(html).toContain('<html lang="de-DE">');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/de/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="en-GB" href="${SITE}/">`);
    expect(html).toContain('<meta property="og:locale" content="de_DE">');
    expect(html).toContain(`<meta property="og:url" content="${SITE}/de/">`);
    expect(html).toContain('<title>Luka Engels — Lead Software Engineer, Agentic AI &amp; LLM-Plattformen</title>');
    expect(html).toContain('"jobTitle": "Lead Software Engineer"');
    expect(html).toContain('Unbefristete, vollständig remote Festanstellung');
  });

  it('is prerendered in German', () => {
    const root = rootOf(html);
    expect(root).toContain('Beruflicher Werdegang');
    expect(root).toContain('Deutsch und kroatisch');
    expect(root).not.toContain('Professional Experience');
  });

  it('has no English head left over', () => {
    expect(html).not.toContain('LLM Platforms</title>');
    expect(html).not.toContain('<meta property="og:locale" content="en_GB">');
    expect(html).toContain('<meta property="og:locale:alternate" content="en_GB">');
  });

  it('carries the language script once and no offer bar markup', () => {
    expect(count(html, 'Diese Seite gibt es auch auf Deutsch.')).toBe(1);
    expect(rootOf(html)).not.toContain('lang-offer');
  });
});

describe('localised links', () => {
  const en = rootOf(read('index.html'));
  const de = rootOf(read('de/index.html'));

  it('English page links the English CV, the English legal pages and the German page', () => {
    expect(en).toContain('href="/cv-luka-engels-en.html"');
    expect(en).not.toContain('href="/cv-luka-engels-de.html"');
    expect(en).toContain('href="/legal-notice.html"');
    expect(en).toContain('href="/privacy.html"');
    expect(en).toMatch(/<a href="\/de\/"[^>]*>DE<\/a>/);
  });

  it('German page links the German CV, the German legal pages and the English page', () => {
    expect(de).toContain('href="/cv-luka-engels-de.html"');
    expect(de).not.toContain('href="/cv-luka-engels-en.html"');
    expect(de).toContain('href="/impressum.html"');
    expect(de).toContain('href="/datenschutz.html"');
    expect(de).toMatch(/<a href="\/"[^>]*>EN<\/a>/);
  });

  it('marks the active language', () => {
    expect(en).toMatch(/<a href="\/"[^>]*aria-current="true"[^>]*>EN<\/a>/);
    expect(de).toMatch(/<a href="\/de\/"[^>]*aria-current="true"[^>]*>DE<\/a>/);
  });
});
