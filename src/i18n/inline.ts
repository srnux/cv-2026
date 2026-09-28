import type { Lang } from './lang';

/**
 * The one script that runs on every home and article page, in both languages,
 * inlined into <head> by the Vite plugin (home page) and by the article
 * generator. It is plain ES5 and self-contained because it ships unbundled and
 * has to run before the body renders.
 *
 * - On a German page (/de, /de/...) it does nothing.
 * - A stored explicit choice of "de" replaces the English page with its German
 *   counterpart before anything paints, so English never flashes first.
 * - A stored "en" means the visitor already said no; nothing is offered.
 * - Otherwise, if the browser prefers German, a bar at the bottom of the
 *   viewport offers the German page. Detection alone never navigates and never
 *   stores anything; only a click does.
 *
 * Because it builds the bar itself at runtime, the bar is never part of the
 * prerendered or generated HTML: crawlers and ATS parsers never see it, and
 * React never has to hydrate it.
 *
 * The path rule (German = "/de" + English path) and the detection rule
 * (/^de(-|$)/i) mirror paths.ts and preference.ts; keep them in step.
 */
export const languageScript = `(function () {
  var path = location.pathname;
  if (path === '/de' || path.indexOf('/de/') === 0) return;
  var target = '/de' + path + location.search + location.hash;
  var stored = null;
  try { stored = localStorage.getItem('lang'); } catch (e) {}
  if (stored === 'de') { location.replace(target); return; }
  if (stored === 'en') return;
  var langs = navigator.languages || [navigator.language || ''];
  var german = false;
  for (var i = 0; i < langs.length; i++) if (/^de(-|$)/i.test(langs[i])) german = true;
  if (!german) return;
  function save(value) { try { localStorage.setItem('lang', value); } catch (e) {} }
  function show() {
    var bar = document.createElement('div');
    bar.id = 'lang-offer';
    bar.setAttribute('lang', 'de');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Sprachauswahl');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;flex-wrap:wrap;' +
      'align-items:center;justify-content:center;gap:12px 16px;padding:14px 16px;background:#000;color:#fff;' +
      'border-top:1px solid #fff;font:300 15px/1.4 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;';
    var button = 'padding:6px 16px;font:400 13px/1.4 "Space Grotesk",Inter,Arial,sans-serif;letter-spacing:0.06em;' +
      'border:1px solid #fff;cursor:pointer;text-decoration:none;';
    var text = document.createElement('span');
    text.textContent = 'Diese Seite gibt es auch auf Deutsch.';
    var link = document.createElement('a');
    link.href = target;
    link.textContent = 'Auf Deutsch lesen';
    link.style.cssText = button + 'background:#fff;color:#000;';
    link.onclick = function () { save('de'); };
    var stay = document.createElement('button');
    stay.type = 'button';
    stay.textContent = 'English';
    stay.style.cssText = button + 'background:transparent;color:#fff;';
    stay.onclick = function () { save('en'); bar.remove(); };
    bar.appendChild(text);
    bar.appendChild(link);
    bar.appendChild(stay);
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
  else show();
})();`;

/** onclick value for a static language switcher link: remember the choice, then follow the link. */
export const storeOnClick = (lang: Lang): string => `try{localStorage.setItem('lang','${lang}')}catch(e){}`;
