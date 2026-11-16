// Records one GIF per scenario of <saga-stepper> for platforms without JavaScript (dev.to).
// Needs: playwright, a local static server for this folder, and Python with Pillow for GIF assembly.
// Usage: python -m http.server 8765  (in this folder), then: node record-gifs.js [light|dark]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
;(async () => {
  const theme = process.argv[2] || 'light'
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 960, height: 560 }, deviceScaleFactor: 1 })
  for (const id of ['happy', 'credit', 'sign', 'deposit']) {
    await page.goto('http://localhost:8765/demo.html')
    await page.evaluate(t => {
      document.documentElement.setAttribute('data-theme', t)
      document.querySelector('saga-stepper').setAttribute('theme', t)
    }, theme)
    await page.waitForFunction(() => customElements.get('saga-stepper'))
    const el = await page.$('saga-stepper')
    const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'saga-'))
    const done = page.evaluate(() => new Promise(r => document.addEventListener('saga-finished', r, { once: true })))
    await page.evaluate(id => { document.querySelector('saga-stepper').run(id) }, id)
    let n = 0, finished = false
    done.then(() => (finished = true))
    while (!finished && n < 400) {
      await el.screenshot({ path: path.join(dir, String(n++).padStart(4, '0') + '.png') })
      await page.waitForTimeout(120)
    }
    await el.screenshot({ path: path.join(dir, String(n++).padStart(4, '0') + '.png') })
    const out = `saga-${id}-${theme}.gif`
    execFileSync('python3', [path.join(__dirname, 'frames-to-gif.py'), dir, out])
    console.log('Wrote ' + out)
  }
  await browser.close()
})()
