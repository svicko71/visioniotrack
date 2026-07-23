/**
 * Small runtime-safety utilities. Keep pure & side-effect free.
 */

/** Truncate long strings safely for display. Returns "" for nullish. */
export const clamp = (v: unknown, max = 140): string => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};

/** Fallback for possibly-null/undefined values in JSX. */
export const or = <T,>(v: T | null | undefined, fallback: T): T => (v ?? fallback);

/** Validate IPv4 or hostname (no protocol, no path). Prevents SSRF-ish inputs into ws://IP. */
export const isSafeHost = (host: string): boolean => {
  if (!host || host.length > 253) return false;
  const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
  const hostname = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return ipv4.test(host) || hostname.test(host);
};

/** Safely open an external URL — only allow http(s) & mailto. Prevents `javascript:` XSS. */
export const safeOpen = (url: string) => {
  try {
    const u = new URL(url, window.location.origin);
    if (!["http:", "https:", "mailto:"].includes(u.protocol)) return;
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  } catch { /* noop */ }
};

/** fetch with a hard timeout so slow APIs never hang the UI. */
export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
};

/** Race a promise against a timeout (for supabase-js calls that don't accept AbortSignal). */
export const withTimeout = <T,>(p: Promise<T>, ms = 15000, label = "operation"): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms)),
  ]);

/** Read/write localStorage with try/catch (private mode / quota). */
export const safeLS = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string): boolean {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  },
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

/** Basic text sanitizer for user-supplied strings echoed back into the UI. */
export const sanitizeText = (v: unknown, max = 500): string =>
  clamp(String(v ?? "").replace(/[<>]/g, ""), max);
