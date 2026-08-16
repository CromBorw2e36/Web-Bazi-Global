import { chromium } from 'playwright'

/**
 * End-to-end smoke test against a running server.
 *
 * Covers the path a real user takes: register, hit the empty state, save a
 * chart, read the day, write a journal entry, and come back to it. It also
 * checks the two things that must never regress quietly — that an anonymous
 * visitor cannot reach a protected page, and that the cron endpoint refuses a
 * request without the shared secret.
 *
 *   npm run build && npm start
 *   npm run e2e
 */
const OUT = process.env.E2E_SCREENSHOT_DIR ?? '.'
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3100'
const EMAIL = `e2e${Date.now()}@example.com`

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

const step = (n) => console.log(`  → ${n}`)
const fail = (m) => { console.error(`  ✗ ${m}`); process.exitCode = 1 }

// 0. The public index must be part of the app, not an island
step('index page')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
if (!(await page.locator('header a[href="/today"]').count())) fail('index has no app nav')
if (!(await page.locator('button[aria-label*="giao diện"]').count())) fail('index has no theme toggle')
if (!(await page.locator('a[href="/login"]').count())) fail('index has no way to sign in')
await page.waitForTimeout(800)
if (!(await page.locator('a[href="/register"]').count())) fail('index offers no way to save the chart')

// 0b. Birth place: search without diacritics, and the map dialog on top
step('place field')
await page.click('#birth-input')
await page.fill('#birth-input', 'dong nai')
await page.waitForTimeout(400)
const hits = await page.locator('#birth-list [role=option]').allInnerTexts()
if (!hits.some((t) => /Đồng Nai/.test(t))) fail(`accent-free search missed: ${hits.slice(0, 3).join(', ')}`)
await page.locator('#birth-list [role=option]').first().click()
await page.waitForTimeout(400)
if (!/Đồng Nai/.test(await page.locator('#birth-input').inputValue())) fail('picking from the list did not stick')

await page.click('button:has-text("Chọn trên bản đồ")')
await page.waitForTimeout(3000)
// The dialog must escape the sticky panel it is declared in, or the chart cards
// paint straight over it.
const onBody = await page.evaluate(
  () => document.querySelector('[role=dialog]')?.parentElement === document.body,
)
if (!onBody) fail('map dialog is not portalled to body — it will be clipped')
const covers = await page.evaluate(() =>
  Boolean(document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('[role=dialog]')),
)
if (!covers) fail('something paints over the map dialog')
await page.click('button:has-text("Huỷ")')
await page.waitForTimeout(300)

// 1. Register
step('register')
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' })
await page.fill('#name', 'Nguyễn Test')
await page.fill('#email', EMAIL)
await page.fill('#password', 'test-password-123')
await page.fill('#confirm', 'test-password-123')
await Promise.all([page.waitForURL(/\/(today|profiles)/, { timeout: 30000 }), page.click('button[type=submit]')])
console.log(`    landed on ${new URL(page.url()).pathname}`)

// 2. Empty state prompts for a chart
step('empty state')
const emptyText = await page.locator('main').innerText()
if (!/Chưa có lá số nào/.test(emptyText)) fail(`expected empty-state prompt, got: ${emptyText.slice(0, 120)}`)
await page.screenshot({ path: `${OUT}/e2e-empty.png` })

// 3. Create a profile
step('create profile')
await page.goto(`${BASE}/profiles/new`, { waitUntil: 'networkidle' })
await page.fill('#p-name', 'Tôi')
await page.fill('#p-date', '1990-06-15')
await page.fill('#p-time', '08:30')
await Promise.all([page.waitForURL("**/profiles", { timeout: 30000 }), page.click("button:has-text(\"Lưu lá số\")")])
await page.waitForLoadState('networkidle')
const listText = await page.locator('main').innerText()
if (!/Tôi/.test(listText) || !/Tân Hợi/.test(listText)) fail(`profile row wrong: ${listText.slice(0, 200)}`)
console.log(`    ${listText.split('\n').filter(Boolean).slice(2, 6).join(' | ')}`)
await page.screenshot({ path: `${OUT}/e2e-profiles.png` })

// 4. Today page renders a reading
step('today')
await page.goto(`${BASE}/today`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const todayText = await page.locator('main').innerText()
if (!/Luận Giải/.test(todayText)) fail('reading section missing')
if (!/Lưu Nhật/i.test(todayText)) fail('day pillar block missing')
if (/Kim, Kim|Kim và Kim/.test(todayText)) fail('duplicate element label regressed')
const avoidBlock = todayText.split('NÊN TRÁNH')[1] ?? ''
if (/Lục Hợp/.test(avoidBlock.split('Luận Giải')[0] ?? '')) fail('a harmony is being shown as something to avoid')
await page.screenshot({ path: `${OUT}/e2e-today.png`, fullPage: true })
console.log('\n--- TODAY PAGE ---\n' + todayText.slice(0, 1400))

// 5. Journal round-trip
step('journal write')
await page.fill('#note', 'Hôm nay họp xong sớm, mọi việc thuận.')
await page.click('button:has-text("Ngày tốt")')
await page.waitForTimeout(1200)
await page.click('button:has-text("Lưu")')
await page.waitForTimeout(2000)

await page.goto(`${BASE}/journal`, { waitUntil: 'networkidle' })
const journalText = await page.locator('main').innerText()
if (!/họp xong sớm/.test(journalText)) fail(`journal entry not persisted: ${journalText.slice(0, 200)}`)
if (!/Ngày tốt/.test(journalText)) fail('bookmark not persisted')
await page.screenshot({ path: `${OUT}/e2e-journal.png` })
console.log('\n--- JOURNAL ---\n' + journalText.slice(0, 400))

// 6. Protected routes reject a signed-out visitor
step('auth gate')
const anon = await browser.newContext()
const anonPage = await anon.newPage()
await anonPage.goto(`${BASE}/today`, { waitUntil: 'networkidle' })
if (!/\/login/.test(anonPage.url())) fail(`anonymous visitor reached ${anonPage.url()}`)
console.log(`    anonymous /today -> ${new URL(anonPage.url()).pathname}`)

// 7. Cron endpoint refuses without the secret
const bad = await anonPage.request.get(`${BASE}/api/cron/daily-digest`)
if (bad.status() !== 401) fail(`cron without secret returned ${bad.status()}, expected 401`)
const good = await anonPage.request.get(`${BASE}/api/cron/daily-digest`, {
  headers: { authorization: 'Bearer dev-cron-secret' },
})
if (good.status() !== 200) fail(`cron with secret returned ${good.status()}`)
console.log(`    cron: no secret ${bad.status()}, with secret ${good.status()} ${JSON.stringify(await good.json())}`)

// 8. Mobile layout — measured, not assumed
step('mobile layout')
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const mp = await phone.newPage()

// Sign in as the account this run created, so the signed-in pages render.
await mp.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await mp.fill('#email', EMAIL)
await mp.fill('#password', 'test-password-123')
// The login page carries no nav, so this submit button is unambiguous.
await Promise.all([mp.waitForURL(/\/today/, { timeout: 30000 }), mp.click('button[type=submit]')])

for (const path of ['/today', '/profiles', '/journal', '/settings', '/']) {
  await mp.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await mp.waitForTimeout(900)

  // A page that scrolls sideways on a phone is broken, full stop.
  const overflow = await mp.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 0) fail(`${path} scrolls horizontally by ${overflow}px at 390px`)

  // Anything tappable needs a real target. 40px is the floor; 44 is the aim.
  const small = await mp.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('button, a[href]')) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      if (r.height < 40) out.push(`${(el.textContent || el.getAttribute('aria-label') || '?').trim().slice(0, 20)} h=${Math.round(r.height)}`)
    }
    return out
  })
  if (small.length) fail(`${path} has targets under 40px: ${small.join(', ')}`)
}

// The bottom tab row is the phone's primary navigation — it must be there.
const tabs = await mp.locator('nav.fixed a').count()
if (tabs !== 4) fail(`expected 4 bottom tabs on mobile, found ${tabs}`)
console.log(`    5 pages at 390px: no overflow, no target under 40px, ${tabs} tabs`)

await browser.close()
if (!process.exitCode) console.log('\n  ✓ end-to-end flow passed')
