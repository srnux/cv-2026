// Renders the infographic to PNG with Playwright.
// Usage: node render.js [light|dark] [scale] [output.png]
// Example: node render.js light 2 cloud-design-patterns-grouped.png
const { chromium } = require('playwright')
const path = require('path')
;(async () => {
  const theme = process.argv[2] || 'light'
  const scale = Number(process.argv[3] || 2)
  const out = process.argv[4] || `cloud-design-patterns-grouped-${theme}.png`
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: scale })
  await page.goto('file://' + path.join(__dirname, 'cloud-patterns-infographic.html'))
  await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out, fullPage: true })
  await browser.close()
  console.log('Wrote ' + out)
})()
