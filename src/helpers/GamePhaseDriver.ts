import type { PluginContext, SidebarSnapshot } from '../types';

export interface GamePhaseDriverOptions<P> {
  /** Default 1000 ms. Matches Hypixel's sidebar refresh cadence. */
  pollIntervalMs?: number;
  /** Map a sidebar snapshot to a phase. Return null/undefined for "not my game". */
  detectPhase: (snapshot: SidebarSnapshot | null) => P;
  /**
   * Called once if the proxy doesn't implement `scoreboard.getSidebar()`.
   * The driver self-stops after firing this; use it to log/disable a feature.
   */
  onUnsupported?: () => void;
}

export type PhaseListener<P> = (prev: P | null, next: P) => void;
export type PollListener<P> = (current: P) => void;

/**
 * Generic sidebar-driven phase machine. Polls the sidebar at a fixed interval,
 * runs a consumer-supplied parser, and fires transition listeners only when
 * the phase value changes.
 *
 * The phase type `P` is whatever the consumer's parser produces: an enum,
 * union of string literals, plain string, anything that compares with `!==`.
 */
export class GamePhaseDriver<P> {
  private handle: number | null = null;
  private value: P | null = null;
  private listeners: Array<PhaseListener<P>> = [];
  private pollListeners: Array<PollListener<P>> = [];
  private unsupportedFired = false;

  constructor(
    private ctx: PluginContext,
    private opts: GamePhaseDriverOptions<P>,
  ) {}

  /** Last observed phase, or null if the driver hasn't ticked yet. */
  get current(): P | null {
    return this.value;
  }

  get isRunning(): boolean {
    return this.handle !== null;
  }

  /** True when the proxy exposes `scoreboard.getSidebar()`. */
  isAvailable(): boolean {
    const sb = this.ctx.scoreboard as { getSidebar?: () => unknown };
    return typeof sb.getSidebar === 'function';
  }

  start(): void {
    if (this.handle !== null) return;
    this.handle = this.ctx.scheduler.setInterval(
      () => this.tick(),
      this.opts.pollIntervalMs ?? 1000,
    );
  }

  stop(): void {
    if (this.handle !== null) {
      this.ctx.scheduler.clearInterval(this.handle);
      this.handle = null;
    }
  }

  onTransition(listener: PhaseListener<P>): void {
    this.listeners.push(listener);
  }

  offTransition(listener: PhaseListener<P>): void {
    const i = this.listeners.indexOf(listener);
    if (i >= 0) this.listeners.splice(i, 1);
  }

  /**
   * Fires every poll with the current phase, even when it hasn't changed.
   * Useful for defensive per-tick checks (race-condition reconciliation).
   * Prefer `onTransition` when you only care about edges.
   */
  onPoll(listener: PollListener<P>): void {
    this.pollListeners.push(listener);
  }

  offPoll(listener: PollListener<P>): void {
    const i = this.pollListeners.indexOf(listener);
    if (i >= 0) this.pollListeners.splice(i, 1);
  }

  private tick(): void {
    if (!this.isAvailable()) {
      this.stop();
      if (!this.unsupportedFired) {
        this.unsupportedFired = true;
        this.opts.onUnsupported?.();
      }
      return;
    }
    const snapshot = this.ctx.scoreboard.getSidebar();
    const next = this.opts.detectPhase(snapshot);
    if (next !== this.value) {
      const prev = this.value;
      this.value = next;
      for (const l of this.listeners) l(prev, next);
    }
    for (const l of this.pollListeners) l(next);
  }
}
