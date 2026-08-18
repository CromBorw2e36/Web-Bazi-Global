'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { plainLong, plainShort, type Locale, type Plain } from '@/lib/bazi'
import { Han } from './ui'

/**
 * A piece of vocabulary the reader can ask about.
 *
 * Both wordings are always in the markup and CSS shows one, keyed off the
 * `plain` class on <html> — same arrangement as the theme. That means switching
 * reading mode re-renders nothing, and a server-rendered page is correct for
 * either mode without knowing which the reader prefers.
 *
 * The explanation opens as a sheet rather than a hover tooltip because most of
 * this is read on a phone, where there is no hover and a floating panel next to
 * a term in a 74px-wide column has nowhere to go.
 */
export function Term({
  term,
  plain,
  locale,
  mark,
  className = '',
}: {
  /** The technical name, shown in expert mode. */
  term: string
  /** Everyday wording, shown in plain mode and inside the sheet. */
  plain: Plain
  locale: Locale
  /** Han glyphs for the term, shown in the sheet as a secondary mark. */
  mark?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Terms sit inside pressable cards in the luck timeline.
          e.stopPropagation()
          setOpen(true)
        }}
        /*
          Underlined at rest, not only on hover: nobody taps a word that looks
          like text, and on a phone there is no hover to discover it with. The
          dotted rule is the annotation mark this typography already implies.
        */
        className={`cursor-pointer underline decoration-ink-faint/45 decoration-dotted underline-offset-[3px] transition-colors hover:decoration-cinnabar ${className}`}
        /*
          No aria-label: the accessible name should be whichever wording is
          actually on screen, and only one of the two spans below is displayed.
        */
        aria-haspopup="dialog"
        /*
          Marks this as a target inside a run of text, which WCAG 2.5.8 exempts
          from the minimum target size — a word in a sentence cannot be 44px
          tall without wrecking the sentence. The mobile check in scripts/e2e.mjs
          reads this attribute; anything that is a control rather than a word
          must not carry it.
        */
        data-inline-target=""
        title={locale === 'vi' ? `${term} — bấm để xem giải thích` : `${term} — tap for an explanation`}
      >
        <span className="plain:hidden">{term}</span>
        <span className="hidden plain:inline">{plainShort(plain, locale)}</span>
      </button>
      {open && (
        <TermSheet term={term} plain={plain} locale={locale} mark={mark} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

function TermSheet({
  term,
  plain,
  locale,
  mark,
  onClose,
}: {
  term: string
  plain: Plain
  locale: Locale
  mark?: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={term}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-2xl border border-rule bg-paper-raised p-5 shadow-xl sm:rounded-seal"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">{term}</h2>
          {mark && <Han className="text-sm text-ink-faint">{mark}</Han>}
          <div aria-hidden className="h-px flex-1 bg-rule" />
        </div>

        <p className="mb-1.5 text-sm font-medium text-cinnabar">{plainShort(plain, locale)}</p>
        <p className="text-sm leading-relaxed text-ink-soft">{plainLong(plain, locale)}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full cursor-pointer rounded-seal border border-rule py-2 text-sm font-medium text-ink-soft transition-colors hover:border-rule-strong hover:text-ink"
        >
          {locale === 'vi' ? 'Đóng' : 'Close'}
        </button>
      </div>
    </div>,
    document.body,
  )
}

/**
 * A heading that reads differently in each mode, without an explanation sheet.
 * Used where the plain wording is the whole point and there is nothing more to
 * say than the substitution itself.
 */
export function PlainLabel({ term, plain, locale }: { term: string; plain: Plain; locale: Locale }) {
  return (
    <>
      <span className="plain:hidden">{term}</span>
      <span className="hidden plain:inline">{plainShort(plain, locale)}</span>
    </>
  )
}
