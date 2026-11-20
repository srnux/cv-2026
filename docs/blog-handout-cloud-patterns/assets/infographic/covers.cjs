// Draws the two article covers in the style of the earlier ones:
// black ground, grey UI cards with skeleton lines, thin connectors, green checks, one gold accent, no text.
// Usage: node covers.cjs <outDir> [cover file names...]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const C = {
  bar: '#5c5c5c', barLight: '#7d7d7d', line: '#8c8c8c', icon: '#d4d4d4',
  green: '#4ba35c', gold1: '#d6b25a', gold2: '#b48c34', goldInk: '#2b2412',
}

const ICON = {
  house: 'M3 11 12 4l9 7M5 9.5V20h14V9.5M10 20v-6h4v6',
  person: 'M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5',
  personCheck: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M15 10.5l2 2 4.5-4.5',
  pen: 'M14.5 4.5l5 5L10 19H5v-5l9.5-9.5ZM3 22h18',
  euro: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.6a4.5 4.5 0 1 0 0 6.8M7 11h6M7 13.2h6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.8 2.6 2.8 15.4 0 18M12 3c-2.8 2.6-2.8 15.4 0 18',
  undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  retry: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5',
  check: 'M7 12.5l3.2 3.2L17 9',
  shield: 'M12 3l7.5 3v6c0 4.6-3.2 7.7-7.5 9-4.3-1.3-7.5-4.4-7.5-9V6L12 3ZM8.5 12l2.5 2.5 4.5-4.5',
  queue: 'M3 6h12M3 12h12M3 18h12M18 9l3 3-3 3',
  db: 'M12 8.5c3.9 0 7-1.1 7-2.5S15.9 3.5 12 3.5 5 4.6 5 6s3.1 2.5 7 2.5ZM5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  gate: 'M3 12h11M10.5 8l3.5 4-3.5 4M15 4h5v16h-5',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  phone: 'M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5ZM11 18h2',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
  pulse: 'M3 12h4l2.5-6 5 12 2.5-6h4',
}

const defs = `
<defs>
  <radialGradient id="bg" cx="55%" cy="45%" r="75%">
    <stop offset="0" stop-color="#151515"/><stop offset="1" stop-color="#030303"/>
  </radialGradient>
  <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2c2c2c"/><stop offset="1" stop-color="#1c1c1c"/>
  </linearGradient>
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1b1b1b"/><stop offset="1" stop-color="#121212"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.gold1}"/><stop offset="1" stop-color="${C.gold2}"/>
  </linearGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".75"/>
  </filter>
  <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
    <path d="M1 1l8 4-8 4" fill="none" stroke="${C.line}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>`

const icon = (name, x, y, size = 24, color = C.icon, w = 1.7) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${ICON[name]}" fill="none" stroke="${color}" stroke-width="${(w * 24) / size}" stroke-linecap="round" stroke-linejoin="round"/></g>`

const iconTile = (name, x, y, s = 46, opts = {}) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="11" fill="${opts.fill || 'url(#tile)'}" stroke="${opts.stroke || '#3a3a3a'}"/>` +
  icon(name, x + (s - 26) / 2, y + (s - 26) / 2, 26, opts.color || C.icon)

const bars = (x, y, widths, color = C.bar, gap = 18, h = 8) =>
  widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="${h / 2}" fill="${i === 0 ? C.barLight : color}"/>`).join('')

const card = (x, y, w, h, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#card)" stroke="#3c3c3c" filter="url(#sh)" ${extra}/>`

const badge = (kind, cx, cy, r = 15) => {
  if (kind === 'check')
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.green}"/>` + icon('check', cx - 12, cy - 12, 24, '#fff', 2.4)
  if (kind === 'retry')
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3a3a3a" stroke="#555"/>` + icon('retry', cx - 9, cy - 9, 18, '#e0e0e0', 2)
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2e2e2e" stroke="#4a4a4a"/>`
}

const arrow = (d, dashed = false) =>
  `<path d="${d}" fill="none" stroke="${C.line}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ah)" ${dashed ? 'stroke-dasharray="6 7"' : ''}/>`
const dot = (cx, cy, r = 4.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.line}"/>`

// Faint dotted ground, like the soft floor of the earlier covers.
const ground = () => {
  let s = ''
  for (let x = 20; x < 1200; x += 28) for (let y = 20; y < 500; y += 28) s += `<circle cx="${x}" cy="${y}" r="1" fill="#ffffff" opacity=".045"/>`
  return s
}

const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">${defs}<rect width="1200" height="500" fill="url(#bg)"/>${ground()}${body}</svg>`

// ---------- Saga: five steps, pivot in gold, compensations running back underneath ----------
function saga() {
  const steps = [
    { icon: 'house', badge: 'check' },
    { icon: 'personCheck', badge: 'check' },
    { icon: 'pen', pivot: true },
    { icon: 'euro', badge: 'retry' },
    { icon: 'globe', badge: 'retry' },
  ]
  const W = 180, H = 168, Y = 92, GAP = 50, X0 = 45
  let s = ''
  // connectors first so cards sit on top
  steps.forEach((_, i) => {
    if (i === steps.length - 1) return
    const x1 = X0 + i * (W + GAP) + W, x2 = x1 + GAP
    s += dot(x1 + 2, Y + H / 2, 3.5) + arrow(`M${x1 + 6} ${Y + H / 2}H${x2 - 6}`)
  })
  // compensation lane under steps 1 and 2
  const cy = 352, ch = 92
  const cx1 = X0, cx2 = X0 + W + GAP
  s += dot(cx2 + W / 2, Y + H + 2, 3.5) + arrow(`M${cx2 + W / 2} ${Y + H + 8}V${cy - 8}`, true)
  s += arrow(`M${cx2 - 4} ${cy + ch / 2}H${cx1 + W + 6}`, true)
  ;[cx1, cx2].forEach(x => {
    s += `<rect x="${x}" y="${cy}" width="${W}" height="${ch}" rx="14" fill="#141414" stroke="#4a4a4a" stroke-dasharray="5 6"/>`
    s += iconTile('undo', x + 18, cy + 23, 46)
    s += bars(x + 80, cy + 30, [78, 56])
  })
  // the pivot divides the lane: a faint vertical rule after the pivot
  const px = X0 + 2 * (W + GAP)
  s += `<path d="M${px + W + GAP / 2} ${Y + H + 40}V${cy + ch}" stroke="#2c2c2c" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>`
  // forward-only track under the retriable steps
  const rx = X0 + 3 * (W + GAP)
  s += `<rect x="${rx}" y="${cy + 30}" width="${2 * W + GAP}" height="32" rx="16" fill="#101010" stroke="#2f2f2f"/>`
  for (let i = 0; i < 9; i++) s += `<path d="M${rx + 34 + i * 44} ${cy + 39}l8 7-8 7" fill="none" stroke="#4d4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  // step cards
  steps.forEach((st, i) => {
    const x = X0 + i * (W + GAP)
    if (st.pivot) {
      const y = Y - 14, h = H + 28
      s += `<rect x="${x}" y="${y}" width="${W}" height="${h}" rx="16" fill="url(#gold)" filter="url(#sh)"/>`
      s += iconTile('pen', x + 20, y + 22, 50, { fill: '#2a2414', stroke: '#2a2414', color: C.gold1 })
      s += bars(x + 20, y + 98, [128, 96, 112], '#6e5a2a').replaceAll(C.barLight, '#3a3018').replaceAll('#6e5a2a', '#5a4a22')
      // signature stroke
      s += `<path d="M${x + 22} ${y + h - 30}c14-16 22-16 26-4s10 10 18-4 16-10 22 0 14 6 26-6" fill="none" stroke="${C.goldInk}" stroke-width="2.6" stroke-linecap="round"/>`
      s += `<path d="M${x + 22} ${y + h - 16}H${x + W - 22}" stroke="#7c6328" stroke-width="2" stroke-linecap="round"/>`
      return
    }
    s += card(x, Y, W, H)
    s += iconTile(st.icon, x + 18, Y + 18)
    s += badge(st.badge, x + W - 32, Y + 40)
    s += bars(x + 18, Y + 88, [124, 92, 108])
  })
  return svg(s)
}

// ---------- Cloud patterns: the six groups as six cards, each showing what its patterns do; connectors are the typical combinations ----------
function cloud() {
  const X = [40, 427, 814], Y = [30, 270], W = 346, H = 200
  const ink = C.goldInk, goldLine = '#7c6328', goldBar = '#5a4a22'
  const mini = (name, x, y, s, isz = 16, o = {}) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s / 4}" fill="${o.fill || '#232323'}" stroke="${o.stroke || '#3a3a3a'}"/>` +
    (name ? icon(name, x + (s - isz) / 2, y + (s - isz) / 2, isz, o.color || C.icon, 1.7) : '')
  const ok = (cx, cy, r = 9) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.green}"/>` + icon('check', cx - r * 0.85, cy - r * 0.85, r * 1.7, '#fff', 2.2)
  const fail = (cx, cy, r = 9) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2e2e2e" stroke="#5a5a5a"/><path d="M${cx - r * 0.38} ${cy - r * 0.38}l${r * 0.76} ${r * 0.76}M${cx + r * 0.38} ${cy - r * 0.38}l${-r * 0.76} ${r * 0.76}" stroke="#bdbdbd" stroke-width="1.8" stroke-linecap="round"/>`
  const curve = (x1, y1, x2, y2, o = {}) =>
    `<path d="M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}" fill="none" stroke="${C.line}" stroke-width="2" stroke-linecap="round" ${o.arrow === false ? '' : 'marker-end="url(#ah)"'} ${o.dash ? 'stroke-dasharray="5 6"' : ''}/>`
  const head = (x, y, name, widths, gold = false) =>
    gold
      ? mini(name, x + 18, y + 18, 42, 22, { fill: '#2a2414', stroke: '#2a2414', color: C.gold1 }) +
        `<rect x="${x + 74}" y="${y + 26}" width="${widths[0]}" height="8" rx="4" fill="#3a3018"/><rect x="${x + 74}" y="${y + 44}" width="${widths[1]}" height="8" rx="4" fill="${goldBar}"/>`
      : mini(name, x + 18, y + 18, 42, 22, { fill: 'url(#tile)' }) + bars(x + 74, y + 26, widths)

  let s = `<defs><marker id="ahInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1l8 4-8 4" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`

  // typical combinations: E -> F, B -> C, C -> D
  s += dot(X[0] + W / 2, Y[0] + H + 5, 3.5) + arrow(`M${X[0] + W / 2} ${Y[0] + H + 10}V${Y[1] - 7}`)
  s += dot(X[1] + W + 5, Y[0] + H / 2, 3.5) + arrow(`M${X[1] + W + 10} ${Y[0] + H / 2}H${X[2] - 7}`)
  s += dot(X[2] + W / 2, Y[0] + H + 5, 3.5) + arrow(`M${X[2] + W / 2} ${Y[0] + H + 10}V${Y[1] - 7}`)

  // E, gateway and edge: three clients, one entry point, three services
  {
    const x = X[0], y = Y[0]
    s += card(x, y, W, H) + head(x, y, 'gate', [112, 72])
    const cy = [y + 96, y + 136, y + 176], g = { x: x + 150, y: y + 136 }
    ;['person', 'phone', 'code'].forEach((ic, i) => {
      s += curve(x + 54, cy[i], g.x - 6, g.y, { arrow: false })
      s += curve(g.x + 46, g.y, x + 236, cy[i])
    })
    ;['person', 'phone', 'code'].forEach((ic, i) => {
      s += mini(ic, x + 22, cy[i] - 16, 32, 18)
      s += `<rect x="${x + 242}" y="${cy[i] - 13}" width="84" height="26" rx="8" fill="#1a1a1a" stroke="#353535"/><rect x="${x + 254}" y="${cy[i] - 3}" width="${[52, 40, 58][i]}" height="6" rx="3" fill="${C.bar}"/>`
    })
    s += `<rect x="${g.x - 4}" y="${y + 92}" width="50" height="88" rx="12" fill="#262626" stroke="#4a4a4a"/>` + icon('shield', g.x + 9, g.y - 12, 24)
  }

  // B, messaging and load: a burst, a queue that buffers it, workers that take one message each
  {
    const x = X[1], y = Y[0], cy = y + 136
    s += card(x, y, W, H) + head(x, y, 'queue', [104, 66])
    s += `<path d="M${x + 22} ${cy}h10l5-26 6 50 6-42 6 32 5-14h8" fill="none" stroke="${C.icon}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
    s += arrow(`M${x + 72} ${cy}H${x + 92}`)
    s += `<rect x="${x + 98}" y="${cy - 20}" width="124" height="40" rx="10" fill="#141414" stroke="#3a3a3a"/>`
    for (let i = 0; i < 5; i++) s += `<rect x="${x + 106 + i * 22.5}" y="${cy - 12}" width="17" height="24" rx="4" fill="${i < 2 ? '#262626' : i === 4 ? C.barLight : C.bar}"/>`
    s += dot(x + 226, cy, 3.5)
    ;[cy - 40, cy, cy + 40].forEach(wy => {
      s += curve(x + 230, cy, x + 262, wy)
      s += `<rect x="${x + 268}" y="${wy - 15}" width="58" height="30" rx="8" fill="#1a1a1a" stroke="#353535"/>` + ok(x + 284, wy, 8) + `<rect x="${x + 298}" y="${wy - 3}" width="18" height="6" rx="3" fill="${C.bar}"/>`
    })
  }

  // C, data: cache in front, shards behind it, an append-only log
  {
    const x = X[2], y = Y[0]
    s += card(x, y, W, H) + head(x, y, 'db', [96, 76])
    s += curve(x + 56, y + 130, x + 100, y + 103)
    s += curve(x + 56, y + 146, x + 100, y + 163, { dash: true })
    s += mini('code', x + 22, y + 121, 34, 18)
    s += `<rect x="${x + 106}" y="${y + 84}" width="136" height="38" rx="10" fill="#262626" stroke="#4a4a4a"/>`
    s += icon('pulse', x + 116, y + 93, 20) + `<rect x="${x + 146}" y="${y + 100}" width="54" height="6" rx="3" fill="${C.barLight}"/>` + ok(x + 222, y + 103, 9)
    s += `<rect x="${x + 106}" y="${y + 140}" width="136" height="46" rx="10" fill="none" stroke="#3a3a3a" stroke-dasharray="4 5"/>`
    ;[0, 1, 2].forEach(i => { s += mini('db', x + 114 + i * 42, y + 146, 34, 20) })
    for (let i = 0; i < 4; i++) s += `<rect x="${x + 262}" y="${y + 86 + i * 20}" width="64" height="14" rx="5" fill="#1a1a1a" stroke="#3a3a3a"/><rect x="${x + 270}" y="${y + 91 + i * 20}" width="${[34, 26, 40, 30][i]}" height="4" rx="2" fill="${C.bar}"/>`
    s += `<rect x="${x + 262}" y="${y + 166}" width="64" height="14" rx="5" fill="none" stroke="#5a5a5a" stroke-dasharray="3 4"/><path d="M${x + 294} ${y + 169}v8M${x + 290} ${y + 173}h8" stroke="${C.icon}" stroke-width="1.6" stroke-linecap="round"/>`
  }

  // F, operations and evolution: a service with its sidecar, legacy blocks replaced one by one
  {
    const x = X[0], y = Y[1]
    s += card(x, y, W, H) + head(x, y, 'sliders', [100, 70])
    s += `<rect x="${x + 22}" y="${y + 84}" width="84" height="96" rx="10" fill="#1a1a1a" stroke="#353535"/>` + bars(x + 34, y + 100, [56, 40, 48], C.bar, 16, 6)
    s += `<path d="M${x + 106} ${y + 132}H${x + 116}" stroke="${C.line}" stroke-width="2"/>`
    s += `<rect x="${x + 116}" y="${y + 104}" width="36" height="56" rx="8" fill="#262626" stroke="#4a4a4a"/>` + icon('sliders', x + 124, y + 122, 20)
    for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) {
      const bx = x + 182 + c * 48, by = y + 84 + r * 46
      s += c === 0 || (c === 1 && r === 1)
        ? `<rect x="${bx}" y="${by}" width="40" height="40" rx="9" fill="none" stroke="#4a4a4a" stroke-dasharray="4 4"/>`
        : `<rect x="${bx}" y="${by}" width="40" height="40" rx="9" fill="#262626" stroke="#4a4a4a"/><rect x="${bx + 10}" y="${by + 17}" width="20" height="6" rx="3" fill="${C.barLight}"/>`
    }
    s += arrow(`M${x + 182} ${y + 186}H${x + 324}`)
  }

  // A, resilience: retries with growing waits end in success; a bulkhead keeps one failure in its compartment
  {
    const x = X[1], y = Y[1], ly = y + 104
    s += card(x, y, W, H) + head(x, y, 'shield', [108, 68])
    s += `<path d="M${x + 54} ${ly}H${x + 290}" stroke="${C.line}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>`
    s += mini('code', x + 22, ly - 16, 32, 18)
    s += fail(x + 82, ly) + fail(x + 114, ly) + fail(x + 168, ly) + ok(x + 252, ly, 10)
    s += mini('db', x + 292, ly - 16, 32, 18)
    const bx = x + 22, by = y + 140, bw = 304, bh = 42
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="#141414" stroke="#3a3a3a"/>`
    for (let i = 1; i < 4; i++) s += `<path d="M${bx + (i * bw) / 4} ${by}V${by + bh}" stroke="#3a3a3a" stroke-width="2"/>`
    for (let i = 0; i < 4; i++) {
      const cx = bx + (i * bw) / 4 + bw / 8
      if (i === 2) {
        s += `<rect x="${bx + (i * bw) / 4 + 3}" y="${by + 3}" width="${bw / 4 - 6}" height="${bh - 6}" rx="7" fill="#000" opacity=".35"/>` + fail(cx, by + bh / 2)
        continue
      }
      ;[-18, 0, 18].forEach(d => { s += `<circle cx="${cx + d}" cy="${by + bh / 2}" r="5" fill="${d ? C.bar : C.barLight}"/>` })
    }
  }

  // D, distributed transactions (gold): a chain of local steps, the third fails, compensations run back
  {
    const x = X[2], y = Y[1]
    s += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="16" fill="url(#gold)" filter="url(#sh)"/>` + head(x, y, 'link', [104, 72], true)
    const nx = [x + 22, x + 102, x + 182, x + 262], ny = y + 82, ns = 44
    nx.forEach((n, i) => {
      if (i) s += `<path d="M${nx[i - 1] + ns + 4} ${ny + ns / 2}H${n - 6}" stroke="${ink}" stroke-width="2" stroke-linecap="round" ${i === 3 ? 'stroke-dasharray="3 5"' : 'marker-end="url(#ahInk)"'}/>`
      if (i === 3) { s += `<rect x="${n}" y="${ny}" width="${ns}" height="${ns}" rx="10" fill="none" stroke="${goldLine}" stroke-width="1.6" stroke-dasharray="4 4"/>`; return }
      s += `<rect x="${n}" y="${ny}" width="${ns}" height="${ns}" rx="10" fill="#e3c574" stroke="${goldLine}" stroke-width="1.5"/>`
      s += i < 2 ? icon('check', n + 8, ny + 8, 28, ink, 2.4) : `<path d="M${n + 15} ${ny + 15}l14 14M${n + 29} ${ny + 15}l-14 14" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`
    })
    const ly = y + 172, c = i => nx[i] + ns / 2
    s += `<path d="M${c(2)} ${ny + ns + 6}V${ly - 10}q0 10-10 10H${c(0) + 10}q-10 0-10-10V${ny + ns + 10}" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round" marker-end="url(#ahInk)"/>`
    s += `<path d="M${c(1)} ${ly}V${ny + ns + 10}" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round" marker-end="url(#ahInk)"/>`
    ;[0, 1].forEach(i => {
      s += `<rect x="${c(i) + 22}" y="${ly - 13}" width="26" height="26" rx="7" fill="#2a2414"/>` + icon('undo', c(i) + 26, ly - 9, 18, C.gold1, 2)
    })
  }

  return svg(s)
}

// ---------- Listing agent: photos, floor plan and notes in; the record with sources; the broker's form in gold; exposé and XML out ----------
function listing() {
  const P = {
    camera: 'M4 8h3l2-2.5h6L17 8h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    plan: 'M4 4h16v16H4ZM4 12h6M10 4v4M10 16v4M14 12h6M14 4v8',
    doc: 'M6 3h9l4 4v14H6ZM14 3v5h5M9 12h6M9 16h6',
  }
  const ic = (d, x, y, size = 26, color = C.icon, w = 1.7) =>
    `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${(w * 24) / size}" stroke-linecap="round" stroke-linejoin="round"/></g>`
  const tileP = (d, x, y, s = 46, opts = {}) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="11" fill="${opts.fill || 'url(#tile)'}" stroke="${opts.stroke || '#3a3a3a'}"/>` +
    ic(d, x + (s - 26) / 2, y + (s - 26) / 2, 26, opts.color || C.icon)
  const flag = (cx, cy) =>
    `<circle cx="${cx}" cy="${cy}" r="9" fill="#2e2e2e" stroke="#5a5a5a"/><path d="M${cx - 3.5} ${cy - 3.5}l7 7M${cx + 3.5} ${cy - 3.5}l-7 7" stroke="#bdbdbd" stroke-width="1.8" stroke-linecap="round"/>`

  // A greyscale thumbnail of one of the sample photos (Pexels, see listing/README.md). kind: ok | flagged
  const img = name => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'listing', `${name}.jpg`)).toString('base64')
  const photo = (x, y, w, h, name, kind = 'ok') => {
    const id = `ph${x}_${y}`
    let s = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>`
    s += `<image href="${img(name)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#000" stroke-opacity=".5"/>`
    if (kind !== 'ok') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".3" stroke="#5a5a5a" stroke-dasharray="3 4"/>` + flag(x + w - 4, y + 4)
    return s
  }

  // The sample floor plan (2. OG, Musterstraße 12), in its own 900 x 620 coordinates: three bedrooms and a bath to
  // the north, the hallway, living room and kitchen to the south, the balcony below. Doors are gaps with a swing.
  const floorPlan = (x, y, scale) => {
    const wall = '#d6d6d6', thin = '#8f8f8f', paper = '#151515'
    let g = `<g transform="translate(${x} ${y}) scale(${scale})">`
    g += `<rect x="100" y="520" width="380" height="100" fill="none" stroke="${thin}" stroke-width="5" stroke-dasharray="16 12"/>`
    // walls; [x1,y1,x2,y2]
    const walls = [
      [0, 0, 900, 0], [0, 0, 0, 520], [900, 0, 900, 200], [900, 280, 900, 520], [0, 520, 900, 520],
      [260, 0, 260, 200], [480, 0, 480, 200], [660, 0, 660, 200],
      [0, 200, 150, 200], [210, 200, 370, 200], [430, 200, 550, 200], [610, 200, 720, 200], [780, 200, 900, 200],
      [0, 280, 330, 280], [400, 280, 640, 280], [700, 280, 900, 280],
      [580, 280, 580, 520],
    ]
    g += walls.map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="${wall}" stroke-width="16" stroke-linecap="square"/>`).join('')
    // windows: a gap in the outer wall with a thin double line
    const win = (a, b, c, d) => {
      const h = b === d
      return `<path d="M${a} ${b}L${c} ${d}" stroke="${paper}" stroke-width="12"/>` +
        (h ? `<path d="M${a} ${b - 5}H${c}M${a} ${b + 5}H${c}"` : `<path d="M${a - 5} ${b}V${d}M${a + 5} ${b}V${d}"`) + ` stroke="${thin}" stroke-width="3"/>`
    }
    g += [[70, 0, 190, 0], [320, 0, 420, 0], [530, 0, 610, 0], [740, 0, 820, 0], [0, 330, 0, 470], [140, 520, 440, 520], [660, 520, 820, 520]]
      .map(w => win(...w)).join('')
    // door swings into the rooms off the hallway, and the entrance on the east wall
    const door = (hx, hy, r, sweep, dx, dy) =>
      `<path d="M${hx} ${hy}l${dx} ${dy}A${r} ${r} 0 0 ${sweep} ${hx + (dx ? 0 : r * Math.sign(dy) * 0 + r)} ${hy}" fill="none" stroke="${thin}" stroke-width="3"/>`
    g += [[150, 200], [370, 200], [550, 200], [720, 200]].map(([dx]) => `<path d="M${dx} 200V140A60 60 0 0 1 ${dx + 60} 200" fill="none" stroke="${thin}" stroke-width="3"/>`).join('')
    g += [[330, 280], [640, 280]].map(([dx]) => `<path d="M${dx} 280V350A70 70 0 0 0 ${dx + 70} 280" fill="none" stroke="${thin}" stroke-width="3"/>`).join('')
    g += `<path d="M900 200H830A70 70 0 0 0 900 270" fill="none" stroke="${thin}" stroke-width="3"/>`
    // furniture
    const f = `fill="none" stroke="${thin}" stroke-width="3"`
    g += `<rect x="40" y="40" width="120" height="140" rx="6" ${f}/><path d="M40 75H160" stroke="${thin}" stroke-width="3"/>` // bed
    g += `<rect x="300" y="40" width="80" height="130" rx="6" ${f}/>` // child's bed
    g += `<rect x="500" y="30" width="140" height="50" rx="4" ${f}/>` // desk
    g += `<rect x="700" y="30" width="170" height="70" rx="30" ${f}/><circle cx="790" cy="160" r="20" ${f}/>` // tub, basin
    g += `<path d="M40 470V340H90M40 470H260" ${f}/><rect x="300" y="360" width="140" height="90" rx="6" ${f}/>` // sofa, table
    g += `<path d="M860 300V500H640" ${f}/><circle cx="840" cy="330" r="12" ${f}/><circle cx="840" cy="370" r="12" ${f}/>` // counter, hob
    return g + '</g>'
  }

  let s = ''

  // inputs: photos, floor plan, notes
  const IX = 40, IW = 250
  const inputs = [
    { y: 30, h: 182 },
    { y: 226, h: 150 },
    { y: 390, h: 78 },
  ]
  const join = { x: 318, y: 248 }
  inputs.forEach(({ y, h }) => {
    const my = y + h / 2
    s += `<path d="M${IX + IW} ${my}H${join.x - 16}q16 0 16 ${my < join.y ? 16 : -16}V${join.y}" fill="none" stroke="${C.line}" stroke-width="2" stroke-linecap="round"/>`
  })
  s += dot(join.x, join.y) + arrow(`M${join.x} ${join.y}H${352}`)

  // photos card: exterior and interiors, plus the dark and the blurry photo that code flags
  const pc = inputs[0]
  s += card(IX, pc.y, IW, pc.h)
  s += tileP(P.camera, IX + 16, pc.y + 14, 38) + bars(IX + 66, pc.y + 21, [96, 64], C.bar, 16, 7)
  const shots = [['13-exterior'], ['01-living'], ['04-kitchen'], ['05-bedroom'], ['14-dark', 'flagged'], ['15-blurry', 'flagged']]
  shots.forEach(([name, k], i) => {
    const tw = 68, th = 50
    s += photo(IX + 16 + (i % 3) * (tw + 9), pc.y + 66 + Math.floor(i / 3) * (th + 8), tw, th, name, k)
  })

  // floor plan card
  const fc = inputs[1]
  s += card(IX, fc.y, IW, fc.h)
  s += `<rect x="${IX + 14}" y="${fc.y + 14}" width="${IW - 28}" height="${fc.h - 28}" rx="8" fill="#151515" stroke="#333"/>`
  s += floorPlan(IX + 42, fc.y + 18, 0.185)

  // notes card
  const nc = inputs[2]
  s += card(IX, nc.y, IW, nc.h)
  s += iconTile('pen', IX + 16, nc.y + 16, 46)
  s += bars(IX + 80, nc.y + 22, [138, 104], C.bar, 18, 7)

  // the record: every fact with its source
  const RX = 360, RY = 44, RW = 290, RH = 412
  s += `<rect x="${RX + 12}" y="${RY - 12}" width="${RW}" height="${RH}" rx="18" fill="#161616" stroke="#2f2f2f"/>`
  s += card(RX, RY, RW, RH)
  s += bars(RX + 24, RY + 24, [150], C.bar, 0, 10) + `<rect x="${RX + 24}" y="${RY + 44}" width="96" height="8" rx="4" fill="${C.bar}"/>`
  const rows = [
    { d: P.doc, w: 120 },
    { d: P.camera, w: 92 },
    { d: P.plan, w: 108 },
    { d: ICON.person, w: 100, broker: true },
    { d: ICON.person, w: 84, broker: true },
  ]
  rows.forEach((r, i) => {
    const y = RY + 80 + i * 64
    s += `<rect x="${RX + 18}" y="${y}" width="${RW - 36}" height="52" rx="11" fill="#1a1a1a" stroke="#333"/>`
    s += r.broker
      ? tileP(r.d, RX + 26, y + 7, 38, { fill: 'url(#gold)', stroke: C.gold2, color: C.goldInk })
      : tileP(r.d, RX + 26, y + 7, 38, { fill: '#232323' })
    s += `<rect x="${RX + 78}" y="${y + 15}" width="${r.w}" height="8" rx="4" fill="${C.barLight}"/><rect x="${RX + 78}" y="${y + 31}" width="${r.w - 36}" height="7" rx="3.5" fill="${C.bar}"/>`
    s += badge('check', RX + RW - 44, y + 26, 13)
  })

  // the broker's form, in gold: a conflict goes out as a question, typed answers come back into the record
  const GX = 690, GY = 296, GW = 206, GH = 158
  s += dot(RX + RW + 2, GY + 52, 3.5) + arrow(`M${RX + RW + 6} ${GY + 52}H${GX - 6}`, true)
  s += arrow(`M${GX - 4} ${GY + 108}H${RX + RW + 6}`, true)
  s += `<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" rx="16" fill="url(#gold)" filter="url(#sh)"/>`
  s += tileP(ICON.person, GX + 18, GY + 18, 46, { fill: '#2a2414', stroke: '#2a2414', color: C.gold1 })
  s += `<rect x="${GX + 78}" y="${GY + 26}" width="104" height="8" rx="4" fill="#3a3018"/><rect x="${GX + 78}" y="${GY + 44}" width="74" height="8" rx="4" fill="#5a4a22"/>`
  ;[0, 1].forEach(i => {
    const y = GY + 82 + i * 34
    s += `<rect x="${GX + 18}" y="${y}" width="${GW - 36}" height="24" rx="7" fill="#e3c574" stroke="#7c6328" stroke-width="1.5"/>`
    s += `<rect x="${GX + 30}" y="${y + 9}" width="${[38, 64][i]}" height="6" rx="3" fill="#5a4a22"/>`
  })

  // outputs: the exposé in two languages, the validated XML
  const ox = 930, OX = 958, OW = 206
  s += `<path d="M${RX + RW + 4} ${150}H${ox}" stroke="${C.line}" stroke-width="2" stroke-linecap="round"/>`
  s += dot(ox, 150)
  s += arrow(`M${ox} 150V${100}q0-12 12-12H${OX - 8}`)
  s += `<path d="M${ox} 150V${336}q0 12 12 12H${OX - 8}" fill="none" stroke="${C.line}" stroke-width="2" marker-end="url(#ah)" stroke-linecap="round"/>`
  // exposé card
  const ey = 34, eh = 232
  s += card(OX, ey, OW, eh)
  s += `<rect x="${OX + 18}" y="${ey + 18}" width="52" height="24" rx="12" fill="#e6e6e6"/><rect x="${OX + 32}" y="${ey + 27}" width="24" height="6" rx="3" fill="#2a2a2a"/>`
  s += `<rect x="${OX + 78}" y="${ey + 18}" width="52" height="24" rx="12" fill="#1a1a1a" stroke="#454545"/><rect x="${OX + 92}" y="${ey + 27}" width="24" height="6" rx="3" fill="#6a6a6a"/>`
  s += photo(OX + 18, ey + 56, OW - 36, 82, '01-living-hero')
  s += bars(OX + 18, ey + 156, [150, 120, 138, 96], C.bar, 17, 7)
  // XML card
  const xy = 296, xh = 160
  s += card(OX, xy, OW, xh)
  s += iconTile('code', OX + 18, xy + 18)
  s += badge('check', OX + OW - 34, xy + 41)
  s += bars(OX + 18, xy + 86, [128, 96], C.bar, 18, 7)
  s += `<rect x="${OX + 18}" y="${xy + 124}" width="${OW - 36}" height="16" rx="8" fill="#101010" stroke="#2f2f2f"/><rect x="${OX + 26}" y="${xy + 129}" width="${OW - 70}" height="6" rx="3" fill="${C.green}" opacity=".85"/>`

  return svg(s)
}

const COVERS = [
  ['saga-pattern-cover.jpg', saga],
  ['cloud-design-patterns-cover.jpg', cloud],
  ['listing-creation-agent-cover.jpg', listing],
]

;(async () => {
  const out = process.argv[2] || '.'
  // Optional cover names after the output dir render only those, so the others stay byte-identical.
  const only = process.argv.slice(3)
  // CHROME=<path to chrome.exe> when the installed Playwright has no matching browser download.
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {})
  const page = await browser.newPage({ viewport: { width: 1200, height: 500 }, deviceScaleFactor: 1 })
  for (const [name, make] of COVERS.filter(([n]) => !only.length || only.includes(n))) {
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${make()}</body></html>`)
    await page.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 1200, height: 500 } })
    console.log('Wrote ' + name)
  }
  await browser.close()
})()
