/**
 * Who counts as an administrator.
 *
 * The list lives in `ADMIN_EMAIL` rather than in the database: there is exactly
 * one operator today, and a column would need a bootstrap path — a first admin
 * that nobody can grant. Comma-separated, so a second operator does not need a
 * schema change.
 *
 * Read at call time, never at module load, so a restart with a changed value is
 * enough and no build-time snapshot is baked in.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * True when `email` is on the admin list.
 *
 * An unset or empty `ADMIN_EMAIL` grants nobody: a deployment that forgets the
 * variable must lock the dashboard, not open it. Silent by design — this runs
 * on every request through the proxy, so the one-line diagnostic belongs at the
 * page guard instead (see `adminConfigured`).
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.trim().toLowerCase())
}

/**
 * Whether an admin list exists at all.
 *
 * Told apart from "you are not an admin" because the two failures need
 * different fixes, and from the browser both look identical — a redirect home.
 */
export function adminConfigured(): boolean {
  return adminEmails().length > 0
}
