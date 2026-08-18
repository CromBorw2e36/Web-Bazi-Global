import type { Metadata, Viewport } from 'next'
import { Noto_Sans, Noto_Serif } from 'next/font/google'
import './globals.css'

/*
  The skill's pairing — Noto Serif TC / Noto Sans TC — is right for the Han
  glyphs but thin on Vietnamese diacritics, which this interface needs far more
  of than it needs Chinese. So the Latin and Vietnamese text is set in the
  regular Noto cuts, loaded and subset by next/font, and the Traditional Chinese
  face is pulled in separately and applied only to the ~60 Han characters that
  actually appear. The browser fetches just the unicode ranges it meets.
*/
const notoSerif = Noto_Serif({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const notoSans = Noto_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

/**
 * `viewportFit: 'cover'` is what makes `env(safe-area-inset-bottom)` resolve to
 * anything other than zero on a notched phone. Without it the bottom tab row
 * sits under the home indicator.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Paints the browser chrome to match the paper, so the status bar does not
  // sit on a strip of white above a cream page.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f0' },
    { media: '(prefers-color-scheme: dark)', color: '#16130f' },
  ],
}

export const metadata: Metadata = {
  title: 'Bát Tự — Tứ Trụ Mệnh Lý | Bazi Four Pillars',
  description:
    'Lập và luận lá số Bát Tự Tứ Trụ với hiệu chỉnh giờ mặt trời theo kinh độ. Cast and read a BaZi chart with true solar time correction for any location on Earth.',
}

/**
 * Applies the stored theme and reading mode before first paint, so a returning
 * reader never sees a flash of light paper or a flash of the vocabulary they
 * switched away from.
 *
 * Light is the default and the system preference is deliberately not consulted:
 * ink on paper is what this interface is, and dark mode is the deviation a
 * reader opts into rather than one their OS opts into for them.
 */
const THEME_INIT = `
try {
  if (localStorage.getItem('bazi-theme') === 'dark') document.documentElement.classList.add('dark');
  if (localStorage.getItem('bazi-plain') === '1') document.documentElement.classList.add('plain');
} catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Loaded by link rather than next/font on purpose. next/font self-hosts,
          which for a CJK face means pulling every unicode range — tens of
          megabytes — whereas Google's CSS is range-split, so the browser fetches
          only the few subsets holding the ~60 Han characters this page uses.
          The lint rule below targets the Pages Router; in the App Router this
          layout *is* the document, so the font loads for every route.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className={`${notoSerif.variable} ${notoSans.variable} paper-grain min-h-screen`}>{children}</body>
    </html>
  )
}
