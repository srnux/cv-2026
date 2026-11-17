// Draws the two article covers in the style of the earlier ones:
// black ground, grey UI cards with skeleton lines, thin connectors, green checks, one gold accent, no text.
// Usage: node covers.cjs <outDir>
const { chromium } = require('playwright')
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

// ---------- Cloud patterns: requests in, six pattern groups in the middle, a healthy system out ----------
function cloud() {
  let s = ''
  // inputs
  const ins = [
    { icon: 'person', y: 70 },
    { icon: 'phone', y: 205 },
    { icon: 'code', y: 340 },
  ]
  const IX = 40, IW = 200, IH = 92
  const join = { x: 285, y: 250 }
  ins.forEach(({ y }) => {
    const my = y + IH / 2
    s += `<path d="M${IX + IW} ${my}H${join.x - 20}q20 0 20 ${my < join.y ? 20 : my > join.y ? -20 : 0}V${join.y}" fill="none" stroke="${C.line}" stroke-width="2" stroke-linecap="round"/>`
  })
  s += dot(join.x, join.y) + arrow(`M${join.x} ${join.y}H${318}`)
  ins.forEach(({ icon: ic, y }) => {
    s += card(IX, y, IW, IH)
    s += iconTile(ic, IX + 18, y + 23)
    s += bars(IX + 80, y + 30, [92, 64])
  })
  // central panel with six group tiles
  const PX = 325, PY = 40, PW = 520, PH = 420
  s += `<rect x="${PX + 14}" y="${PY - 12}" width="${PW}" height="${PH}" rx="18" fill="#161616" stroke="#2f2f2f"/>`
  s += card(PX, PY, PW, PH)
  s += bars(PX + 26, PY + 26, [170], C.bar, 0, 10) + `<rect x="${PX + 26}" y="${PY + 46}" width="110" height="8" rx="4" fill="${C.bar}"/>`
  s += `<circle cx="${PX + PW - 66}" cy="${PY + 40}" r="5" fill="#4a4a4a"/><circle cx="${PX + PW - 48}" cy="${PY + 40}" r="5" fill="#4a4a4a"/><circle cx="${PX + PW - 30}" cy="${PY + 40}" r="5" fill="#4a4a4a"/>`
  const groups = ['shield', 'queue', 'db', 'link', 'gate', 'sliders']
  const TW = 150, TH = 152, TG = 17, TX = PX + 26, TY = PY + 82
  groups.forEach((g, i) => {
    const x = TX + (i % 3) * (TW + TG), y = TY + Math.floor(i / 3) * (TH + TG)
    const isGold = g === 'link'
    if (isGold) {
      s += `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="13" fill="url(#gold)"/>`
      s += iconTile(g, x + 16, y + 16, 46, { fill: '#2a2414', stroke: '#2a2414', color: C.gold1 })
      s += `<rect x="${x + 16}" y="${y + 82}" width="100" height="8" rx="4" fill="#3a3018"/><rect x="${x + 16}" y="${y + 100}" width="74" height="8" rx="4" fill="#5a4a22"/><rect x="${x + 16}" y="${y + 118}" width="88" height="8" rx="4" fill="#5a4a22"/>`
    } else {
      s += `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="13" fill="url(#tile)" stroke="#353535"/>`
      s += iconTile(g, x + 16, y + 16, 46, { fill: '#232323' })
      s += bars(x + 16, y + 82, [100, 74, 88])
    }
  })
  // outputs
  const ox = 870, OX = 905, OW = 255
  s += `<path d="M${PX + PW + 4} ${join.y}H${ox}" stroke="${C.line}" stroke-width="2" stroke-linecap="round"/>`
  s += dot(ox, join.y)
  s += `<path d="M${ox} ${join.y}V${150}q0-20 20-20H${OX - 8}" fill="none" stroke="${C.line}" stroke-width="2" marker-end="url(#ah)" stroke-linecap="round"/>`
  s += `<path d="M${ox} ${join.y}V${350}q0 20 20 20H${OX - 8}" fill="none" stroke="${C.line}" stroke-width="2" marker-end="url(#ah)" stroke-linecap="round"/>`
  // output 1: health chart card
  const y1 = 62, h1 = 150
  s += card(OX, y1, OW, h1)
  s += iconTile('pulse', OX + 18, y1 + 18)
  s += bars(OX + 80, y1 + 26, [96, 70])
  const pts = [0, 14, 8, 22, 18, 30, 26, 40, 36, 44, 50]
  const sx = OX + 20, sy = y1 + h1 - 22, step = (OW - 40) / (pts.length - 1)
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(sx + i * step).toFixed(1)} ${(sy - p).toFixed(1)}`).join('')
  s += `<path d="${d}L${sx + (pts.length - 1) * step} ${sy + 6}H${sx}Z" fill="#ffffff" opacity=".05"/>`
  s += `<path d="${d}" fill="none" stroke="#bdbdbd" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`
  s += `<circle cx="${sx + (pts.length - 1) * step}" cy="${sy - 50}" r="4.5" fill="${C.green}"/>`
  // output 2: checklist card
  const y2 = 290, h2 = 160
  s += card(OX, y2, OW, h2)
  ;[0, 1, 2].forEach(i => {
    const yy = y2 + 32 + i * 44
    s += badge('check', OX + 34, yy, 13)
    s += `<rect x="${OX + 60}" y="${yy - 4}" width="${[132, 104, 150][i]}" height="8" rx="4" fill="${i ? C.bar : C.barLight}"/>`
  })
  return svg(s)
}

;(async () => {
  const out = process.argv[2] || '.'
  // CHROME=<path to chrome.exe> when the installed Playwright has no matching browser download.
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {})
  const page = await browser.newPage({ viewport: { width: 1200, height: 500 }, deviceScaleFactor: 1 })
  for (const [name, make] of [['saga-pattern-cover.jpg', saga], ['cloud-design-patterns-cover.jpg', cloud]]) {
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${make()}</body></html>`)
    await page.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 1200, height: 500 } })
    console.log('Wrote ' + name)
  }
  await browser.close()
})()
