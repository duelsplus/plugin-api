export interface EarlyChatBufferOptions {
  /** Default 50. Cap on buffered messages while collecting. */
  maxSize?: number;
}

/**
 * Bounded FIFO buffer for chat lines received before the plugin has enough
 * context to handle them (typically: chats that arrived before /locraw).
 * Consumers `start()` collecting, `push()` arriving lines, then `drain()` once
 * they're ready to process.
 */
export class EarlyChatBuffer {
  private buffer: string[] = [];
  private collecting = false;
  private readonly maxSize: number;

  constructor(opts: EarlyChatBufferOptions = {}) {
    this.maxSize = opts.maxSize ?? 50;
  }

  get isCollecting(): boolean {
    return this.collecting;
  }

  get size(): number {
    return this.buffer.length;
  }

  start(): void {
    this.collecting = true;
  }

  stop(): void {
    this.collecting = false;
  }

  push(raw: string): void {
    if (!this.collecting) return;
    if (this.buffer.length >= this.maxSize) return;
    this.buffer.push(raw);
  }

  /** Stop collecting, return everything buffered, leave the buffer empty. */
  drain(): string[] {
    this.collecting = false;
    return this.buffer.splice(0);
  }

  clear(): void {
    this.buffer.length = 0;
    this.collecting = false;
  }
}
