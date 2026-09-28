import type { Lang } from './lang';

/**
 * English lives at the root, German under /de/. Every English page that has a
 * German counterpart maps to it by prefixing /de, which is also what the
 * inline language script in inline.ts does; keep the two in step.
 */
export const langFromPath = (pathname: string): Lang =>
  pathname === '/de' || pathname.startsWith('/de/') ? 'de' : 'en';

export function counterpartPath(pathname: string, target: Lang): string {
  if (langFromPath(pathname) === target) return pathname;
  if (target === 'de') return `/de${pathname}`;
  return pathname.slice(3) || '/';
}

export const homePath = (lang: Lang): string => (lang === 'de' ? '/de/' : '/');
