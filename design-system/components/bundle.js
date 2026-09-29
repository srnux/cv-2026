/* @ds-bundle: {"format":4,"namespace":"LE","components":[{"name":"Section"},{"name":"SectionHeading"},{"name":"Button"},{"name":"Chip"},{"name":"Card"},{"name":"RuledHeading"},{"name":"RoleEntry"},{"name":"DefinitionList"},{"name":"ArticleCard"},{"name":"Field"},{"name":"Icon"},{"name":"Mark"},{"name":"LanguageSwitch"},{"name":"Header"},{"name":"Footer"},{"name":"OfferBar"},{"name":"Prose"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function rest(props, omit) {
    var out = {};
    for (var k in props) if (Object.prototype.hasOwnProperty.call(props, k) && omit.indexOf(k) < 0) out[k] = props[k];
    return out;
  }

  // Icon paths copied verbatim from cv-2026/src/components.
  var ICONS = {
    mail: { stroke: 1, paths: ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'] },
    location: { stroke: 1, paths: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'] },
    'check-circle': { stroke: 2, paths: ['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'] },
    print: { stroke: 1.5, paths: ['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z'] },
    linkedin: { fill: true, paths: ['M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z'] },
    github: { fill: true, paths: ['M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'] }
  };

  function Icon(p) {
    var def = ICONS[p.name];
    if (!def) return null;
    var size = p.size || 24;
    return h('svg', {
      className: cx('le-icon', p.className), width: size, height: size, viewBox: '0 0 24 24',
      fill: def.fill ? 'currentColor' : 'none', stroke: def.fill ? undefined : 'currentColor',
      'aria-hidden': p.label ? undefined : 'true', role: p.label ? 'img' : undefined, 'aria-label': p.label
    }, def.paths.map(function (d, i) {
      return h('path', def.fill ? { key: i, d: d } : { key: i, d: d, strokeWidth: def.stroke, strokeLinecap: 'round', strokeLinejoin: 'round' });
    }));
  }

  function Section(p) {
    var ground = p.ground || 'dark';
    return h('section', { id: p.id, 'data-theme': ground, className: cx('le-section', p.className) },
      h('div', { className: 'le-container' }, p.children));
  }

  function SectionHeading(p) {
    return h('header', { className: 'le-section-heading' },
      h('h2', null, p.title),
      p.intro ? h('p', null, p.intro) : null);
  }

  function Button(p) {
    var cls = cx('le-btn', p.size === 'md' ? 'le-btn-md' : 'le-btn-sm',
      p.variant === 'solid' && 'le-btn-solid', p.variant === 'quiet' && 'le-btn-quiet', p.className);
    var kids = [p.icon ? h(Icon, { key: 'i', name: p.icon, size: 16 }) : null, p.children];
    var other = rest(p, ['variant', 'size', 'icon', 'className', 'children', 'href', 'type']);
    if (p.href) return h('a', Object.assign({ href: p.href, className: cls }, other), kids);
    return h('button', Object.assign({ type: p.type || 'button', className: cls }, other), kids);
  }

  function Chip(p) {
    var cls = p.variant === 'tag' ? 'le-tag' : cx('le-chip', p.variant === 'quiet' && 'le-chip-quiet', p.size === 'sm' && 'le-chip-sm');
    return h(p.as || 'span', { className: cx(cls, p.className) }, p.children);
  }

  function Card(p) {
    return h('div', { className: cx('le-card', p.compact && 'le-card-compact', p.className) },
      p.title ? h('h3', { className: 'le-card-title' }, p.title) : null,
      p.body ? h('p', { className: 'le-card-body' }, p.body) : null,
      p.children);
  }

  function RuledHeading(p) {
    return h(p.as || 'h3', { className: 'le-ruled' }, p.children);
  }

  function RoleEntry(p) {
    return h('article', { className: cx('le-role', p.className) },
      h('div', { className: 'le-role-meta' },
        h('h3', null, p.title),
        h('p', { className: 'le-role-org' }, p.organisation),
        p.location ? h('p', { className: 'le-role-muted' }, p.location) : null,
        h('p', { className: 'le-role-muted' }, p.period)),
      h('div', { className: 'le-role-main' },
        p.context ? h('p', { className: 'le-role-context' }, p.context) : null,
        p.description ? h('p', null, p.description) : null,
        p.highlights && p.highlights.length ? h('ul', { className: 'le-dots' }, p.highlights.map(function (t, i) { return h('li', { key: i }, t); })) : null));
  }

  function DefinitionList(p) {
    return h('dl', { className: 'le-deflist' }, p.items.map(function (it) {
      return h('div', { key: it.term }, h('dt', null, it.term), h('dd', null, it.value));
    }));
  }

  function ArticleCard(p) {
    return h('article', { className: 'le-article' },
      h('a', { href: p.href },
        p.coverImage ? h('img', { src: p.coverImage, alt: '', loading: 'lazy' }) : null,
        h('p', { className: 'le-meta' }, p.meta),
        h('h3', null, p.title),
        h('p', { className: 'le-article-summary' }, p.summary)),
      p.tags && p.tags.length ? h('ul', { className: 'le-chips' }, p.tags.map(function (t) { return h(Chip, { key: t, as: 'li', variant: 'quiet' }, t); })) : null,
      p.actions ? h('div', { className: 'le-row' }, p.actions) : null);
  }

  function Field(p) {
    var ctl = p.multiline
      ? h('textarea', { id: p.id, rows: p.rows || 4, className: 'le-input', placeholder: p.placeholder, required: p.required, value: p.value, onChange: p.onChange, defaultValue: p.defaultValue })
      : h('input', { id: p.id, type: p.type || 'text', className: 'le-input', placeholder: p.placeholder, required: p.required, autoComplete: p.autoComplete, value: p.value, onChange: p.onChange, defaultValue: p.defaultValue });
    return h('div', { className: 'le-field' }, h('label', { htmlFor: p.id }, p.label), ctl);
  }

  function Mark(p) {
    var svg = h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1, 'aria-hidden': 'true' },
      h('rect', { x: 2, y: 4, width: 20, height: 16 }),
      h('polyline', { points: '7,9 11,12 7,15' }),
      h('line', { x1: 13, y1: 15, x2: 17, y2: 15 }));
    return h(p.href ? 'a' : 'div', { className: 'le-mark', href: p.href }, svg, h('span', null, p.name));
  }

  function LanguageSwitch(p) {
    var out = [];
    p.languages.forEach(function (l, i) {
      if (i > 0) out.push(' / ');
      out.push(h('a', { key: l.code, href: l.href, hrefLang: l.code, 'aria-current': l.code === p.current ? 'true' : undefined, onClick: l.onSelect }, l.code.toUpperCase()));
    });
    return h('nav', { className: 'le-lang', 'aria-label': p.label || 'Language' }, out);
  }

  function Header(p) {
    return h('header', { className: 'le-header', 'data-fixed': p.fixed ? '' : undefined, 'data-hidden': p.hidden ? '' : undefined },
      h('div', { className: 'le-header-inner' },
        h(Mark, { name: p.name, href: p.homeHref }),
        p.links ? h('nav', null, h('ul', null, p.links.map(function (l) { return h('li', { key: l.href }, h('a', { className: 'le-link', href: l.href }, l.label)); }))) : null,
        h('div', { className: 'le-header-actions' }, p.actions)));
  }

  function Footer(p) {
    return h('footer', { 'data-theme': 'dark', className: 'le-section le-footer' },
      h('div', { className: 'le-footer-top' },
        h(Mark, { name: p.name }),
        h('nav', null, h('ul', null, (p.links || []).map(function (l) { return h('li', { key: l.href }, h('a', { className: 'le-link', href: l.href }, l.label)); }))),
        h('div', { className: 'le-footer-icons' }, (p.social || []).map(function (s) {
          return h('a', { key: s.href, href: s.href, className: 'le-icon-link', 'aria-label': s.label }, h(Icon, { name: s.icon, size: 20 }));
        }))),
      h('div', { className: 'le-footer-bottom' }, h('p', null, p.copyright)));
  }

  function OfferBar(p) {
    return h('div', { className: 'le-offer', role: 'region', 'aria-label': p.label, lang: p.lang, 'data-fixed': p.fixed ? '' : undefined },
      h('span', null, p.message),
      h(Button, { href: p.acceptHref, variant: 'solid', onClick: p.onAccept }, p.acceptLabel),
      h(Button, { onClick: p.onDismiss }, p.dismissLabel));
  }

  function Prose(p) {
    return h('div', { className: cx('le-prose', p.className), dangerouslySetInnerHTML: p.html ? { __html: p.html } : undefined }, p.html ? undefined : p.children);
  }

  window.LE = Object.assign(window.LE || {}, {
    Section: Section, SectionHeading: SectionHeading, Button: Button, Chip: Chip, Card: Card,
    RuledHeading: RuledHeading, RoleEntry: RoleEntry, DefinitionList: DefinitionList, ArticleCard: ArticleCard,
    Field: Field, Icon: Icon, Mark: Mark, LanguageSwitch: LanguageSwitch, Header: Header, Footer: Footer,
    OfferBar: OfferBar, Prose: Prose
  });
})();
