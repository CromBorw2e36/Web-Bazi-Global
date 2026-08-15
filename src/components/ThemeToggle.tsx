'use client'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
    </svg>
  )
}

/**
 * The theme lives in the DOM, not in React state.
 *
 * An inline script in the layout applies the stored choice before first paint,
 * so mirroring it into state would mean reading the DOM in an effect and
 * re-rendering for a value that was already correct. Both icons are rendered
 * and CSS picks one, which also keeps server and client markup identical.
 */
export function ThemeToggle({ label = 'Đổi giao diện sáng / tối' }: { label?: string }) {
  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('bazi-theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex size-11 cursor-pointer sm:size-9 items-center justify-center rounded-seal border border-rule text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
    >
      <span className="hidden dark:block">
        <SunIcon />
      </span>
      <span className="block dark:hidden">
        <MoonIcon />
      </span>
    </button>
  )
}
