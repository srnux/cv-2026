/**
 * <saga-stepper> — interactive Saga pattern demo (rental onboarding example).
 * Framework-agnostic custom element, no dependencies, styles isolated in shadow DOM.
 *
 * Usage:
 *   <script type="module" src="/js/saga-stepper.js"></script>
 *   <saga-stepper></saga-stepper>
 *
 * Optional attributes:
 *   theme="light|dark"   force a theme (default follows prefers-color-scheme)
 *   speed="1"            animation speed multiplier (2 = twice as fast)
 *   autoplay="credit"    start a scenario on load: happy | credit | sign | deposit
 *
 * Theming: set any of these CSS custom properties on the element or a parent.
 *   --saga-font, --saga-mono, --saga-text, --saga-muted, --saga-surface, --saga-card,
 *   --saga-border, --saga-radius,
 *   --saga-run-bg, --saga-run-fg, --saga-ok-bg, --saga-ok-fg, --saga-bad-bg, --saga-bad-fg,
 *   --saga-cmp-bg, --saga-cmp-fg, --saga-pivot-bg, --saga-pivot-fg
 */
const STEPS = [
  { name: 'Reserve property', type: 'Compensatable', undo: 'Undo: release property', undoLog: 'Release property' },
  { name: 'Credit check', type: 'Compensatable', undo: 'Undo: discard result', undoLog: 'Discard credit check result' },
  { name: 'Sign contract', type: 'Pivot', undo: 'Point of no return' },
  { name: 'Collect deposit', type: 'Retriable', undo: 'No undo, retry' },
  { name: 'Update portals', type: 'Retriable', undo: 'No undo, retry' },
]

const SCENARIOS = [
  { id: 'happy', label: 'Happy path', failAt: -1 },
  { id: 'credit', label: 'Fail at credit check', failAt: 1 },
  { id: 'sign', label: 'Tenant does not sign', failAt: 2 },
  { id: 'deposit', label: 'Deposit service flaky', failAt: 3 },
]

const CSS = `
:host{
  --_font:var(--saga-font,system-ui,-apple-system,"Segoe UI",sans-serif);
  --_mono:var(--saga-mono,ui-monospace,"Cascadia Code",Consolas,monospace);
  --_text:var(--saga-text,#14182b);--_muted:var(--saga-muted,#5b6378);
  --_surface:var(--saga-surface,#f4f6fa);--_card:var(--saga-card,#ffffff);
  --_border:var(--saga-border,#d9dee8);--_radius:var(--saga-radius,12px);
  --_run-bg:var(--saga-run-bg,#e6f0fd);--_run-fg:var(--saga-run-fg,#1d5fd6);
  --_ok-bg:var(--saga-ok-bg,#e5f5ec);--_ok-fg:var(--saga-ok-fg,#1b7a45);
  --_bad-bg:var(--saga-bad-bg,#fdeaea);--_bad-fg:var(--saga-bad-fg,#b42727);
  --_cmp-bg:var(--saga-cmp-bg,#fdf2dc);--_cmp-fg:var(--saga-cmp-fg,#8a5a00);
  --_pv-bg:var(--saga-pivot-bg,#efedfe);--_pv-fg:var(--saga-pivot-fg,#5a49c8);
  display:block;font-family:var(--_font);color:var(--_text);
}
@media (prefers-color-scheme:dark){:host(:not([theme=light])){
  --_text:var(--saga-text,#e8ecf5);--_muted:var(--saga-muted,#a3acc2);
  --_surface:var(--saga-surface,#161b28);--_card:var(--saga-card,#1c2232);
  --_border:var(--saga-border,#323a50);
  --_run-bg:var(--saga-run-bg,#16294a);--_run-fg:var(--saga-run-fg,#8fb6ff);
  --_ok-bg:var(--saga-ok-bg,#123323);--_ok-fg:var(--saga-ok-fg,#6fd59c);
  --_bad-bg:var(--saga-bad-bg,#3a1717);--_bad-fg:var(--saga-bad-fg,#ff9a9a);
  --_cmp-bg:var(--saga-cmp-bg,#3a2a0c);--_cmp-fg:var(--saga-cmp-fg,#f3c46b);
  --_pv-bg:var(--saga-pivot-bg,#28244d);--_pv-fg:var(--saga-pivot-fg,#b4abff);
}}
:host([theme=dark]){
  --_text:var(--saga-text,#e8ecf5);--_muted:var(--saga-muted,#a3acc2);
  --_surface:var(--saga-surface,#161b28);--_card:var(--saga-card,#1c2232);
  --_border:var(--saga-border,#323a50);
  --_run-bg:var(--saga-run-bg,#16294a);--_run-fg:var(--saga-run-fg,#8fb6ff);
  --_ok-bg:var(--saga-ok-bg,#123323);--_ok-fg:var(--saga-ok-fg,#6fd59c);
  --_bad-bg:var(--saga-bad-bg,#3a1717);--_bad-fg:var(--saga-bad-fg,#ff9a9a);
  --_cmp-bg:var(--saga-cmp-bg,#3a2a0c);--_cmp-fg:var(--saga-cmp-fg,#f3c46b);
  --_pv-bg:var(--saga-pivot-bg,#28244d);--_pv-fg:var(--saga-pivot-fg,#b4abff);
}
*{box-sizing:border-box}
.zone{display:grid;grid-template-columns:3fr 2fr;gap:18px;font-size:12px;color:var(--_muted);text-align:center}
.zone div{border-top:1px dashed var(--_border);padding-top:6px}
.grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px;margin:10px 0 4px}
.st{position:relative;border:1px solid var(--_border);border-radius:var(--_radius);padding:12px 10px;background:var(--_card);min-height:150px;transition:background .3s,border-color .3s}
.st:not(:last-child)::after{content:"";position:absolute;right:-15px;top:42px;width:12px;border-top:1.5px solid var(--_muted)}
h4{margin:0 0 8px;font-size:14px;font-weight:600;line-height:1.3}
.pill{display:inline-block;font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid var(--_border);color:var(--_muted);background:var(--_surface)}
.pill.pv{background:var(--_pv-bg);color:var(--_pv-fg);border-color:transparent}
.undo{font-size:12px;color:var(--_muted);margin-top:8px;line-height:1.4}
.status{font-size:13px;font-weight:600;margin-top:8px;color:var(--_muted)}
.run{background:var(--_run-bg)}.run .status{color:var(--_run-fg)}
.ok{background:var(--_ok-bg)}.ok .status{color:var(--_ok-fg)}
.bad{background:var(--_bad-bg)}.bad .status{color:var(--_bad-fg)}
.cmp{background:var(--_cmp-bg)}.cmp .status{color:var(--_cmp-fg)}
.ctl{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
button{font:inherit;font-size:14px;padding:7px 14px;border-radius:8px;border:1px solid var(--_border);background:var(--_card);color:var(--_text);cursor:pointer}
button:hover{border-color:var(--_muted)}
button[aria-pressed=true]{border-color:var(--_run-fg);color:var(--_run-fg)}
button:disabled{opacity:.55;cursor:default}
.log{font-family:var(--_mono);font-size:13px;line-height:1.7;background:var(--_surface);border-radius:8px;padding:10px 14px;min-height:222px;color:var(--_muted)}
.log .e{color:var(--_bad-fg)}.log .c{color:var(--_cmp-fg)}.log .s{color:var(--_ok-fg)}
@media (max-width:720px){
  .zone{display:none}
  .grid{grid-template-columns:1fr;gap:10px}
  .st{min-height:0}
  .st:not(:last-child)::after{right:auto;left:50%;top:auto;bottom:-10px;width:0;height:8px;border-top:0;border-left:1.5px solid var(--_muted)}
}
`

class SagaStepper extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return
    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>${CSS}</style>
      <div class="zone" aria-hidden="true"><div>Compensatable zone (can be undone)</div><div>After the pivot (retry until done)</div></div>
      <div class="grid" role="list" aria-label="Saga steps"></div>
      <div class="ctl" role="group" aria-label="Scenarios">
        ${SCENARIOS.map(s => `<button type="button" data-id="${s.id}" aria-pressed="false">${s.label}</button>`).join('')}
      </div>
      <div class="log" role="log" aria-live="polite">Pick a scenario to run the Saga.</div>`
    this.grid = root.querySelector('.grid')
    this.logEl = root.querySelector('.log')
    this.buttons = [...root.querySelectorAll('button')]
    this.buttons.forEach(b => b.addEventListener('click', () => this.run(b.dataset.id)))
    this.draw()
    const auto = this.getAttribute('autoplay')
    if (auto) this.run(auto)
  }

  get delayFactor() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const speed = Number(this.getAttribute('speed') || 1)
    return (reduced ? 0.4 : 1) / (speed > 0 ? speed : 1)
  }

  wait(ms) {
    return new Promise(r => setTimeout(r, ms * this.delayFactor))
  }

  draw() {
    this.grid.innerHTML = STEPS.map((s, i) => `
      <div class="st" role="listitem" id="s${i}">
        <h4>${s.name}</h4>
        <span class="pill ${s.type === 'Pivot' ? 'pv' : ''}">${s.type}</span>
        <div class="undo">${s.undo}</div>
        <div class="status" id="x${i}">Waiting</div>
      </div>`).join('')
  }

  set(i, cls, text) {
    this.shadowRoot.getElementById('s' + i).className = 'st ' + cls
    this.shadowRoot.getElementById('x' + i).textContent = text
  }

  log(msg, cls = '') {
    const line = document.createElement('div')
    if (cls) line.className = cls
    line.textContent = msg
    this.logEl.appendChild(line)
  }

  async run(id) {
    const scenario = SCENARIOS.find(s => s.id === id)
    if (!scenario || this.busy) return
    this.busy = true
    this.buttons.forEach(b => {
      b.disabled = true
      b.setAttribute('aria-pressed', String(b.dataset.id === id))
    })
    this.draw()
    this.logEl.textContent = ''
    this.log('Orchestrator: Saga started, id saga-4711')
    const f = scenario.failAt
    let outcome = 'COMPLETED'

    for (let i = 0; i < STEPS.length; i++) {
      this.set(i, 'run', 'Running')
      await this.wait(650)

      if (i === f && f < 3) {
        this.set(i, 'bad', 'Failed')
        this.log(`✗ ${STEPS[i].name} failed`, 'e')
        await this.wait(500)
        this.log('Orchestrator: compensating in reverse order', 'c')
        for (let j = i - 1; j >= 0; j--) {
          this.set(j, 'run', 'Compensating')
          await this.wait(600)
          this.set(j, 'cmp', 'Compensated')
          this.log(`↺ ${STEPS[j].undoLog} (step ${j + 1})`, 'c')
          await this.wait(250)
        }
        outcome = 'CANCELLED'
        break
      }

      if (i === f && f === 3) {
        for (let r = 1; r <= 2; r++) {
          this.set(i, 'bad', `Error, retry ${r}`)
          this.log(`! ${STEPS[i].name} timed out, retry ${r} with backoff`, 'e')
          await this.wait(700)
          this.set(i, 'run', 'Retrying')
        }
        await this.wait(500)
      }

      this.set(i, 'ok', 'Done')
      this.log(`✓ ${STEPS[i].name} committed locally`, 's')
      if (i === 2) this.log('Pivot passed: the Saga must now complete', 's')
      await this.wait(200)
    }

    if (outcome === 'CANCELLED') this.log('Saga ended: CANCELLED, the system is consistent again', 'e')
    else this.log('Saga ended: COMPLETED', 's')
    this.dispatchEvent(new CustomEvent('saga-finished', { detail: { scenario: id, outcome }, bubbles: true }))
    this.buttons.forEach(b => (b.disabled = false))
    this.busy = false
  }
}

if (!customElements.get('saga-stepper')) customElements.define('saga-stepper', SagaStepper)
