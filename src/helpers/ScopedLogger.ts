import type { PluginLogger } from '../types';

/**
 * Wraps a {@link PluginLogger} so every line is prefixed with `[scope]`. The
 * scope is part of the logger itself (not the message), so call sites don't
 * have to keep typing the same prefix.
 *
 * Use {@link child} to build a hierarchy: `roster.child('threats')` produces
 * a logger that prefixes `[roster:threats]`, mirroring the proxy's own
 * `Logger.child()` pattern.
 *
 * @example
 * ```ts
 * const log = createLogger(ctx.logger, 'roster');
 * log.debug('sending /who');           // → [roster] sending /who
 * log.child('threats').warn('flagged'); // → [roster:threats] flagged
 * ```
 */
export class ScopedLogger implements PluginLogger {
  constructor(private readonly base: PluginLogger, private readonly scope: string) {}

  /** Scope name as currently configured. Mostly useful for tests. */
  get name(): string {
    return this.scope;
  }

  info(message: string, ...args: unknown[]): void {
    this.base.info(this.prefix(message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.base.warn(this.prefix(message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.base.error(this.prefix(message), ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.base.debug(this.prefix(message), ...args);
  }

  /** Returns a logger with `parent:sub` as its scope. */
  child(sub: string): ScopedLogger {
    return new ScopedLogger(this.base, `${this.scope}:${sub}`);
  }

  private prefix(message: string): string {
    return `[${this.scope}] ${message}`;
  }
}

/** Shorthand for `new ScopedLogger(base, name)`. */
export function createLogger(base: PluginLogger, name: string): ScopedLogger {
  return new ScopedLogger(base, name);
}
