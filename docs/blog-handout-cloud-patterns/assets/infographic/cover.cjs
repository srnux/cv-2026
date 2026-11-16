// Renders a 1200 x 500 article cover: the infographic header plus one group band.
// Usage: node cover.cjs <band letter A-F> <light|dark> <output.jpg>
// Example: node cover.cjs D dark ../../../../public/images/writing/saga-pattern-cover.jpg
const { chromium } = require('playwright')
const path = require('path')
;(async () => {
  const band = (process.argv[2] || 'A').toUpperCase()
  const theme = process.argv[3] || 'dark'
  const out = process.argv[4] || `cover-${band}-${theme}.jpg`
  const W = 1600
  const H = Math.round(W / 2.4) // 1200 x 500 at 0.75 scale
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 0.75 })
  await page.goto('file://' + path.join(__dirname, 'cloud-patterns-infographic.html'))
  await page.evaluate(
    ([t, b]) => {
      document.documentElement.setAttribute('data-theme', t)
      document.querySelector('footer').style.display = 'none'
      for (const s of document.querySelectorAll('section.band')) {
        const letter = s.querySelector('.letter')?.textContent?.trim()
        if (letter !== b) s.style.display = 'none'
        else s.style.marginBottom = '0'
      }
    },
    [theme, band],
  )
  await page.evaluate(() => document.fonts.ready)
  // Centre the remaining content vertically in the 2.4:1 frame.
  const h = await page.evaluate(() => document.body.scrollHeight)
  if (h < H) await page.evaluate(pad => { document.body.style.paddingTop = `${44 + pad}px` }, Math.floor((H - h) / 2))
  await page.screenshot({ path: out, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: W, height: H } })
  await browser.close()
  console.log('Wrote ' + out)
})()
