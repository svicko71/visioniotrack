/**
 * Demo Mode
 * - Visitor (not signed in): all writes are simulated locally, no DB round-trip.
 * - Signed-in user: real writes hit the backend as before.
 *
 * Wrap any mutation in `demoWrite()` and pass a fallback that mutates local state.
 */
import { safeLS } from "./safe";

export const isDemoUser = (userId: string | null | undefined): boolean => !userId;

/** Persist demo-only records per feature so they survive reloads within a session. */
export const demoStore = {
  read<T>(bucket: string, fallback: T[] = []): T[] {
    const raw = safeLS.get(`demo:${bucket}`);
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T[]; } catch { return fallback; }
  },
  write<T>(bucket: string, rows: T[]): void {
    safeLS.set(`demo:${bucket}`, JSON.stringify(rows.slice(0, 200)));
  },
  push<T extends Record<string, any>>(bucket: string, row: T): T & { id: string } {
    const withId = { id: (row as any).id ?? crypto.randomUUID?.() ?? String(Date.now()), ...row };
    const rows = demoStore.read<T & { id: string }>(bucket);
    rows.unshift(withId);
    demoStore.write(bucket, rows);
    return withId;
  },
  clear(bucket: string): void {
    safeLS.remove(`demo:${bucket}`);
  },
};

/**
 * Run either the real backend mutation or a local demo mutation.
 *   const row = await demoWrite(user?.id, "donations", localSeed, realCall);
 */
export async function demoWrite<T>(
  userId: string | null | undefined,
  bucket: string,
  demoRow: T,
  real: () => Promise<T>,
): Promise<{ data: T; demo: boolean }> {
  if (isDemoUser(userId)) {
    const saved = demoStore.push(bucket, demoRow as any);
    return { data: saved as T, demo: true };
  }
  const data = await real();
  return { data, demo: false };
}
