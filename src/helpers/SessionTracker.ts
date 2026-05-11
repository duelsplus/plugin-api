import type { PluginContext } from '../types';

export interface SessionTrackerOptions<S> {
  /** Storage key the session is persisted under. */
  storageKey: string;
  /** Factory for a fresh session (used on first run or after expiry). */
  fresh: () => S;
  /** Custom expiry predicate. Takes precedence over `maxAgeMs`. */
  isExpired?: (saved: S) => boolean;
  /** Shorthand: stale once `Date.now() - saved.startedAt >= maxAgeMs`. */
  maxAgeMs?: number;
}

/**
 * Persisted, mutable session stats with a TTL.
 * Reload-safe: on construction, returns the saved value if not expired,
 * otherwise a fresh one. Consumers update through `update(reducer)` so writes
 * are flushed to storage atomically.
 */
export class SessionTracker<S extends { startedAt: number }> {
  private value: S;

  constructor(
    private ctx: PluginContext,
    private opts: SessionTrackerOptions<S>,
  ) {
    const saved = ctx.storage.get<S>(opts.storageKey);
    this.value = saved && !this.isExpired(saved) ? saved : opts.fresh();
  }

  /** Read-only-by-convention view of the session stats. */
  get stats(): S {
    return this.value;
  }

  /** Apply a mutator and persist the result. */
  update(reducer: (stats: S) => void): void {
    reducer(this.value);
    this.persist();
  }

  reset(): void {
    this.value = this.opts.fresh();
    this.persist();
  }

  persist(): void {
    this.ctx.storage.set(this.opts.storageKey, this.value);
  }

  private isExpired(saved: S): boolean {
    if (this.opts.isExpired) return this.opts.isExpired(saved);
    if (this.opts.maxAgeMs != null) {
      return Date.now() - saved.startedAt >= this.opts.maxAgeMs;
    }
    return false;
  }
}
