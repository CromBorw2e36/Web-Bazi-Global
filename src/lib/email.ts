import 'server-only'
import type { ReadingBody } from './reading/schema'

/**
 * Sends through Resend's HTTP API directly rather than its SDK — one fetch call
 * against a stable endpoint is not worth a dependency. Returns false rather
 * than throwing when unconfigured, so a digest run degrades to a no-op instead
 * of failing the whole batch.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!key || !from) return false

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  })
  return response.ok
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Inline styles only, and no external assets: mail clients strip stylesheets and
 * block remote images by default, so anything that isn't inline simply won't
 * render for most readers.
 */
export function renderDigest(opts: {
  profileName: string
  dateLabel: string
  pillarZh: string
  pillarLabel: string
  body: ReadingBody
  locale: 'vi' | 'en'
  url: string
}): string {
  const vi = opts.locale === 'vi'
  const items = opts.body.practical
    .map((p) => `<li style="margin:0 0 6px;line-height:1.6;color:#57534e">${escape(p)}</li>`)
    .join('')

  return `<!doctype html>
<html lang="${opts.locale}">
<body style="margin:0;padding:24px 12px;background:#faf7f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="max-width:560px;margin:0 auto;border-collapse:collapse">
    <tr><td>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr>
          <td style="width:44px"><div style="width:44px;height:44px;background:#b23a31;border-radius:2px;text-align:center;line-height:44px;color:#fff;font-size:16px;font-weight:700">八字</div></td>
          <td style="padding-left:12px">
            <div style="font-size:16px;font-weight:700;color:#1c1917">${escape(opts.profileName)}</div>
            <div style="font-size:12px;color:#8a8175">${escape(opts.dateLabel)}</div>
          </td>
        </tr>
      </table>

      <div style="background:#fffdf8;border:1px solid #e0d8c8;border-radius:2px;padding:20px">
        <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #e0d8c8">
          <div style="font-size:30px;font-weight:600;color:#b23a31;line-height:1.2">${escape(opts.pillarZh)}</div>
          <div style="font-size:13px;color:#57534e;margin-top:4px">${escape(opts.pillarLabel)}</div>
        </div>

        <h1 style="margin:18px 0 10px;font-size:18px;font-weight:700;color:#1c1917;line-height:1.35">${escape(opts.body.headline)}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#1c1917">${escape(opts.body.summary)}</p>

        <div style="background:#faf7f0;border:1px solid #e0d8c8;border-radius:2px;padding:12px;margin-bottom:10px">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8a8175;margin-bottom:5px">${vi ? 'Nên' : 'Lean into'}</div>
          <div style="font-size:13px;line-height:1.6;color:#57534e">${escape(opts.body.focus)}</div>
        </div>
        <div style="background:#faf7f0;border:1px solid #e0d8c8;border-radius:2px;padding:12px;margin-bottom:16px">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8a8175;margin-bottom:5px">${vi ? 'Nên tránh' : 'Hold lightly'}</div>
          <div style="font-size:13px;line-height:1.6;color:#57534e">${escape(opts.body.caution)}</div>
        </div>

        <ul style="margin:0 0 20px;padding-left:18px;font-size:13px">${items}</ul>

        <a href="${escape(opts.url)}" style="display:inline-block;background:#b23a31;color:#fff;text-decoration:none;padding:10px 18px;border-radius:2px;font-size:13px;font-weight:600">
          ${vi ? 'Xem đầy đủ và ghi nhật ký' : 'Open the full reading'}
        </a>
      </div>

      <p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:#8a8175;text-align:center">
        ${vi
          ? 'Bát Tự mô tả xu thế, không phải định mệnh — quyết định vẫn là của bạn. Tắt email này trong phần Cài Đặt.'
          : 'BaZi describes tendencies, not fate — the decisions stay yours. Turn this email off in Settings.'}
      </p>
    </td></tr>
  </table>
</body>
</html>`
}
