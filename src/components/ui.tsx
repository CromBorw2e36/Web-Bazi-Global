import type { Element } from '@/lib/bazi'

/**
 * Element colour maps.
 *
 * Written out as complete class strings rather than composed at runtime, so
 * Tailwind can see every one of them while scanning the source.
 */
export const ELEMENT_TEXT: Record<Element, string> = {
  WOOD: 'text-wood',
  FIRE: 'text-fire',
  EARTH: 'text-earth',
  METAL: 'text-metal',
  WATER: 'text-water',
}

export const ELEMENT_BG: Record<Element, string> = {
  WOOD: 'bg-wood',
  FIRE: 'bg-fire',
  EARTH: 'bg-earth',
  METAL: 'bg-metal',
  WATER: 'bg-water',
}

export const ELEMENT_BORDER: Record<Element, string> = {
  WOOD: 'border-wood',
  FIRE: 'border-fire',
  EARTH: 'border-earth',
  METAL: 'border-metal',
  WATER: 'border-water',
}

/** Traditional Chinese glyphs, set in the serif TC face. */
export function Han({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span style={{ fontFamily: "'Noto Serif TC', serif" }} className={className}>{children}</span>
}

/** A section heading with a hairline rule and a Han sub-mark. */
export function SectionTitle({ label, mark }: { label: string; mark?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">{label}</h2>
      {mark && (
        <Han className="text-sm text-ink-faint">{mark}</Han>
      )}
      <div aria-hidden className="h-px flex-1 bg-rule" />
    </div>
  )
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-seal border border-rule bg-paper-raised p-5 sm:p-6 ${className}`}>{children}</section>
  )
}
