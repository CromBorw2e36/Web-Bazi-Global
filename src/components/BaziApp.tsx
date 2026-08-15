'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { castChart, OutOfRangeError, UI, pick, type BaziChart, type Locale } from '@/lib/bazi'
import { BirthForm, DEFAULT_VALUES, toBirthInput, type FormValues } from './BirthForm'
import { PillarGrid } from './PillarGrid'
import { StrengthPanel } from './StrengthPanel'
import { RelationList } from './RelationList'
import { LuckTimeline } from './LuckTimeline'
import { Han, Panel } from './ui'

export function BaziApp({ currentYear, signedIn }: { currentYear: number; signedIn: boolean }) {
  const [locale, setLocale] = useState<Locale>('vi')
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES)

  const { chart, error } = useMemo<{ chart: BaziChart | null; error?: string }>(() => {
    const input = toBirthInput(values)
    if ('error' in input) {
      return {
        chart: null,
        error:
          input.error === 'RANGE'
            ? locale === 'vi'
              ? 'Năm sinh nằm ngoài phạm vi hỗ trợ (1901–2099).'
              : 'Birth year is outside the supported range (1901–2099).'
            : locale === 'vi'
              ? 'Ngày hoặc giờ sinh chưa hợp lệ.'
              : 'The birth date or time is not valid.',
      }
    }
    try {
      return { chart: castChart(input) }
    } catch (e) {
      return {
        chart: null,
        error:
          e instanceof OutOfRangeError
            ? locale === 'vi'
              ? 'Ngày sinh nằm ngoài phạm vi lịch tiết khí.'
              : 'That date falls outside the solar-term table.'
            : locale === 'vi'
              ? 'Không lập được lá số từ dữ liệu này.'
              : 'Could not cast a chart from this input.',
      }
    }
  }, [values, locale])

  const correction = chart?.correction

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(72px+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 sm:pb-8">
      {/* The seal and app name now live in the nav above, so this is just the
          page's own title and the one control that belongs to it. */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ink">
            {pick(UI.formTitle, locale)}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
            {pick(UI.subtitle, locale)}
            <Han className="text-ink-faint/70">{UI.subtitle.zh}</Han>
          </p>
        </div>

        <div className="flex rounded-seal border border-rule">
          {(['vi', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={locale === l}
              className={`min-h-11 cursor-pointer px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 sm:min-h-9 ${
                locale === l ? 'bg-cinnabar text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        {/* Input */}
        <Panel className="lg:sticky lg:top-6">
          {/* No heading here — the page title above already says what this is,
              and repeating it would just push the first field further down. */}
          <BirthForm values={values} onChange={setValues} locale={locale} error={error} />

          {/* What the solar correction actually did to this birth time. */}
          {correction && (
            <div className="mt-5 border-t border-rule pt-4">
              <div className="mb-2 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                {pick(UI.solarCorrection, locale)}
              </div>
              <dl className="space-y-1 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">{locale === 'vi' ? 'Theo kinh độ' : 'Longitude'}</dt>
                  <dd className="tabular-nums text-ink-soft">
                    {correction.longitudeMinutes >= 0 ? '+' : ''}
                    {correction.longitudeMinutes.toFixed(1)} {locale === 'vi' ? 'phút' : 'min'}
                  </dd>
                </div>
                {values.useEquationOfTime && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-faint">{locale === 'vi' ? 'Phương trình thời gian' : 'Equation of time'}</dt>
                    <dd className="tabular-nums text-ink-soft">
                      {correction.equationOfTimeMinutes >= 0 ? '+' : ''}
                      {correction.equationOfTimeMinutes.toFixed(1)} {locale === 'vi' ? 'phút' : 'min'}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-2 border-t border-rule pt-1">
                  <dt className="font-medium text-ink-soft">{locale === 'vi' ? 'Giờ mặt trời' : 'Solar time'}</dt>
                  <dd className="font-medium tabular-nums text-ink">
                    {String(correction.corrected.hour).padStart(2, '0')}:
                    {String(correction.corrected.minute).padStart(2, '0')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </Panel>

        {/* Chart */}
        {chart && (
          <div className="min-w-0 space-y-6">
            {/* Caveats surface next to the result, not buried in a footnote. */}
            {(chart.onTermBoundary || chart.correction.dayShifted) && (
              <div className="space-y-2">
                {chart.onTermBoundary && (
                  <p className="flex items-start gap-2 rounded-seal border border-earth/40 bg-earth/5 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
                    <span className="mt-px shrink-0 text-earth" aria-hidden>⚠</span>
                    <span>{pick(UI.boundaryWarning, locale)}</span>
                  </p>
                )}
                {chart.correction.dayShifted && (
                  <p className="flex items-start gap-2 rounded-seal border border-water/40 bg-water/5 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
                    <span className="mt-px shrink-0 text-water" aria-hidden>◑</span>
                    <span>{pick(UI.dayShifted, locale)}</span>
                  </p>
                )}
              </div>
            )}

            <PillarGrid chart={chart} locale={locale} />
            <StrengthPanel chart={chart} locale={locale} />
            <RelationList chart={chart} locale={locale} />
            <LuckTimeline chart={chart} locale={locale} today={{ year: currentYear }} />

            {/* Casting a chart used to be a dead end. This is the only place the
                page asks for anything, and it asks once, after the work is done. */}
            <Panel className="border-cinnabar/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-[240px] flex-1">
                  <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                    {locale === 'vi' ? 'Lưu lá số này?' : 'Save this chart?'}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {locale === 'vi'
                      ? 'Lá số đã lưu sẽ có luận giải riêng cho từng ngày, chỗ ghi nhật ký để đối chiếu về sau, và lưu được cả lá số người thân.'
                      : 'A saved chart gets a reading for each day, a journal to check those readings against what actually happened, and room for family charts alongside your own.'}
                  </p>
                </div>
                <Link
                  href={signedIn ? '/profiles/new' : '/register'}
                  className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-seal bg-cinnabar px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                >
                  {signedIn
                    ? locale === 'vi'
                      ? 'Lưu vào hồ sơ'
                      : 'Save to profiles'
                    : locale === 'vi'
                      ? 'Tạo tài khoản'
                      : 'Create an account'}
                </Link>
              </div>
            </Panel>
          </div>
        )}
      </div>

      <footer className="mt-10 border-t border-rule pt-5 text-[11px] leading-relaxed text-ink-faint">
        {locale === 'vi' ? (
          <p>
            Bảng tra can chi, tàng can, thập thần, trường sinh và dụng thần lấy từ cơ sở dữ liệu gốc. Mốc tiết khí được
            tính từ vị trí biểu kiến của mặt trời, sai số khoảng ±15 phút. Trụ năm và trụ tháng so theo thời điểm tuyệt
            đối nên đúng ở mọi múi giờ; trụ ngày và trụ giờ theo giờ mặt trời tại nơi sinh.
          </p>
        ) : (
          <p>
            Stems, branches, hidden stems, ten gods, life phases and favourable elements come from the source database.
            Solar-term instants are computed from the Sun’s apparent position and are accurate to roughly ±15 minutes.
            Year and month pillars are decided by absolute time, so they hold in any zone; day and hour pillars follow
            local solar time at the place of birth.
          </p>
        )}
      </footer>
    </div>
  )
}
