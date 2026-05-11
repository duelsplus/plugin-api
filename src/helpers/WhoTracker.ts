import type { PluginContext } from '../types';

const HYPIXEL_WHO_PREFIX = /^ONLINE:/i;
const DEFAULT_WHO_COMMAND = '/who';
const DEFAULT_THROTTLE_MS = 1500;

export interface WhoTrackerOptions {
  /** Default `/who`. */
  command?: string;
  /** Default 1500 ms. Server rate-limits make back-to-back sends rude. */
  throttleMs?: number;
  /** Default `/^ONLINE:/i` (Hypixel's response). Must match the line that lists names. */
  responsePrefix?: RegExp;
}

const USERNAME_RE = /^[A-Za-z0-9_]{1,16}$/;

function stripFormatting(s: string): string {
  return s.replace(/§[0-9a-fk-or]/gi, '');
}

function readChatText(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return stripFormatting(node);
  if (Array.isArray(node)) return node.map((n) => readChatText(n)).join('');
  if (typeof node === 'object') {
    const rec = node as Record<string, unknown>;
    let text = rec.text ? readChatText(rec.text) : '';
    if (typeof rec.translate === 'string') text += stripFormatting(rec.translate);
    if (Array.isArray(rec.with)) text += rec.with.map((n) => readChatText(n)).join('');
    if (rec.extra) text += readChatText(rec.extra);
    return text;
  }
  return '';
}

function flattenChat(raw: string): string {
  try {
    return readChatText(JSON.parse(raw));
  } catch {
    return stripFormatting(raw);
  }
}

/**
 * Sends `/who` (configurable) and harvests usernames from the response line.
 * Throttled and parser-agnostic; consumers feed chat into `captureResponse()`.
 */
export class WhoTracker {
  private names = new Set<string>();
  private lastSentAt = 0;
  private retryHandle: number | null = null;
  private readonly command: string;
  private readonly throttleMs: number;
  private readonly responsePrefix: RegExp;

  constructor(private ctx: PluginContext, opts: WhoTrackerOptions = {}) {
    this.command = opts.command ?? DEFAULT_WHO_COMMAND;
    this.throttleMs = opts.throttleMs ?? DEFAULT_THROTTLE_MS;
    this.responsePrefix = opts.responsePrefix ?? HYPIXEL_WHO_PREFIX;
  }

  getNames(): Set<string> {
    return this.names;
  }

  clearNames(): void {
    this.names.clear();
    this.lastSentAt = 0;
  }

  /** Sends the configured command, respecting the throttle. No-op if too recent. */
  send(): void {
    const now = Date.now();
    if (now - this.lastSentAt < this.throttleMs) return;
    this.lastSentAt = now;
    this.ctx.client.sendGameChat(this.command);
  }

  /** Feed a raw chat packet body in; non-matching lines are ignored. */
  captureResponse(raw: string): void {
    const text = flattenChat(raw);
    if (!this.responsePrefix.test(text.trim())) return;

    const tail = text.replace(this.responsePrefix, '').replace(/^[:\s]+/, '');
    const parts = tail
      .split(',')
      .map((s) => stripFormatting(s).trim())
      .filter((s) => USERNAME_RE.test(s));

    for (const p of parts) this.names.add(p);
  }

  /** Single-slot retry timer; scheduling replaces any pending retry. */
  scheduleRetry(fn: () => void, delayMs: number): void {
    this.clearRetry();
    this.retryHandle = this.ctx.scheduler.setTimeout(fn, delayMs);
  }

  clearRetry(): void {
    if (this.retryHandle !== null) {
      this.ctx.scheduler.clearTimeout(this.retryHandle);
      this.retryHandle = null;
    }
  }
}
