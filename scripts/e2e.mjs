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

await browser.close()
if (!process.exitCode) console.log('\n  ✓ end-to-end flow passed')
