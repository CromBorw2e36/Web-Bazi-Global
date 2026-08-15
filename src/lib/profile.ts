// Prisma 7's `prisma-client` generator suffixes row types with `Model`.
import type { ProfileModel } from '@/generated/prisma/models'
import { castChart, type BaziChart, type BirthInput } from '@/lib/bazi'

export type Profile = ProfileModel

/** A stored profile as the engine wants it. */
export function toBirthInput(profile: Profile): BirthInput {
  return {
    year: profile.birthYear,
    month: profile.birthMonth,
    day: profile.birthDay,
    hour: profile.birthHour,
    minute: profile.birthMinute,
    gender: profile.gender,
    longitude: profile.longitude,
    utcOffset: profile.utcOffset,
    useEquationOfTime: profile.useEquationOfTime,
  }
}

/**
 * Charts are cast from the stored birth record on every read rather than
 * persisted, so a correction to the engine reaches every existing profile
 * without a migration.
 */
export const chartFor = (profile: Profile): BaziChart => castChart(toBirthInput(profile))
