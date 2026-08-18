'use client'

/**
 * Switches the vocabulary between the traditional terms and everyday wording.
 *
 * Like the theme, the setting lives as a class on <html> rather than in React
 * state. Every glossed label renders both wordings and CSS picks one, so this
 * button flips a class and nothing re-renders — and a server-rendered page is
 * already correct for whichever mode the reader last chose.
 *
 * The label names the destination, not the current state: in expert mode it
 * offers "Dễ hiểu", and once there it offers the way back.
 */
function togglePlain() {
  const next = !document.documentElement.classList.contains('plain')
  document.documentElement.classList.toggle('plain', next)
  try {
    localStorage.setItem('bazi-plain', next ? '1' : '0')
  } catch {}
}

export function PlainToggle() {
  return (
    <button
      type="button"
      onClick={togglePlain}
      aria-label="Đổi cách gọi thuật ngữ: lời thường hoặc thuật ngữ chuyên môn"
      title="Đổi cách gọi thuật ngữ: lời thường hoặc thuật ngữ chuyên môn"
      className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-seal border border-rule px-2.5 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink sm:h-9"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h9M8.5 6c0 4.5-2 7.5-5 9M6 11.5c1.5 2.5 4 4.2 7 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 20l4-10 4 10M14.6 16.5h4.8" />
      </svg>
      {/* The label is the first thing to go when the bar is tight; the icon and
          the tooltip carry it on a phone. The breakpoint and the mode are kept
          on separate elements rather than stacked as `plain:sm:hidden`, so
          neither variant has to win an ordering contest against the other. */}
      <span className="hidden whitespace-nowrap sm:inline">
        <span className="plain:hidden">Dễ hiểu</span>
        <span className="hidden plain:inline">Chuyên sâu</span>
      </span>
    </button>
  )
}

/**
 * The same switch, worded as a sentence and set inline.
 *
 * The bar-top button collapses to an icon on a phone, which is exactly the
 * screen where a reader most needs to be told this mode exists — so the offer
 * is repeated once, in words, at the top of the chart. Both controls read the
 * same class, so they can never disagree.
 */
export function PlainToggleInline({ locale = 'vi' }: { locale?: 'vi' | 'en' }) {
  return (
    <button
      type="button"
      onClick={togglePlain}
      // Sits inside a sentence, so it takes the same WCAG 2.5.8 inline
      // exemption as a glossary term. The bar-top button is the full-size one.
      data-inline-target=""
      className="cursor-pointer font-medium text-cinnabar underline decoration-dotted underline-offset-[3px] hover:decoration-solid"
    >
      <span className="plain:hidden">
        {locale === 'vi' ? 'đổi toàn bộ sang lời thường' : 'switch it all to everyday wording'}
      </span>
      <span className="hidden plain:inline">
        {locale === 'vi' ? 'quay lại thuật ngữ chuyên môn' : 'back to the traditional terms'}
      </span>
    </button>
  )
}
