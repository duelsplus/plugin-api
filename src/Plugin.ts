/**
 * Plugin Base Class
 * Extend this class to create a Duels+ plugin.
 *
 * @example
 * ```typescript
 * import { Plugin, PluginContext } from '@duelsplus/plugin-api';
 *
 * export default class MyPlugin extends Plugin {
 *   id = 'my-plugin';
 *   name = 'My Plugin';
 *   description = 'Does cool things';
 *
 *   onLoad(ctx: PluginContext) {
 *     ctx.gameModes.register({
 *       id: 'example-mode',
 *       match: ({ gametype, mode }) => gametype === 'MYGAME' && mode === 'MY_MODE',
 *       extractStats: () => ({ wins: 0, losses: 0, winstreak: 0, bestWinstreak: 0, tagKills: 0, tagDeaths: 0 }),
 *     });
 *     ctx.events.on('game:start', (payload) => {
 *       ctx.client.sendChat(`§aGame started on ${payload.map}!`);
 *     });
 *     ctx.commands.register({
 *       name: 'myplugin',
 *       description: 'My plugin command',
 *       execute: (args) => {
 *         ctx.client.sendChat('§bHello from my plugin!');
 *       },
 *     });
 *   }
 *
 *   onEnable() {
 *     this.logger.info('Enabled!');
 *   }
 *
 *   onDisable() {
 *     this.logger.info('Disabled!');
 *   }
 * }
 * ```
 *
 * @module @duelsplus/plugin-api/Plugin
 */

import type { PluginContext, PluginLogger, PluginMetadata } from './types';

/** Plugin lifecycle state */
export type PluginState = 'unloaded' | 'loaded' | 'enabled' | 'disabled' | 'error';

/**
 * Abstract base class for all Duels+ plugins.
 * Override the lifecycle methods to add your plugin's behavior.
 */
export abstract class Plugin {
  /**
   * Unique plugin identifier.
   * @remarks Must match the `duelsplus.id` field in your plugin's package.json so the proxy can load and identify your plugin.
   */
  abstract readonly id: string;

  /**
   * Display name for your plugin (shown in logs and help).
   */
  abstract readonly name: string;

  /**
   * Short description of what the plugin does.
   * @remarks Optional; used in help and plugin listings.
   */
  readonly description: string = '';

  /**
   * Plugin version (semver).
   * @remarks Optional; defaults to "1.0.0" if not set.
   */
  readonly version: string = '1.0.0';

  /**
   * Plugin author.
   * @remarks Optional; used in metadata and plugin listings.
   */
  readonly author: string = '';

  // Internal state - managed by the proxy's PluginManager
  private _state: PluginState = 'unloaded';
  private _context: PluginContext | null = null;

  
  // State Accessors
  

  /** Current plugin state */
  get state(): PluginState {
    return this._state;
  }

  /** Whether the plugin has been loaded */
  get isLoaded(): boolean {
    return this._state !== 'unloaded';
  }

  /** Whether the plugin is currently enabled */
  get isEnabled(): boolean {
    return this._state === 'enabled';
  }

  /** The plugin context (available after onLoad) */
  get context(): PluginContext | null {
    return this._context;
  }

  /**
   * Namespaced logger - available at all times.
   * Before the plugin is loaded, falls back to console.
   */
  protected get logger(): PluginLogger {
    if (this._context) {
      return this._context.logger;
    }
    // Fallback logger before context is injected
    return {
      info: (msg: string, ...args: unknown[]) =>
        console.log(`[Plugin:${this.name}] ${msg}`, ...args),
      warn: (msg: string, ...args: unknown[]) =>
        console.warn(`[Plugin:${this.name}] ${msg}`, ...args),
      error: (msg: string, ...args: unknown[]) =>
        console.error(`[Plugin:${this.name}] ${msg}`, ...args),
      debug: (msg: string, ...args: unknown[]) =>
        console.debug(`[Plugin:${this.name}] ${msg}`, ...args),
    };
  }

  
  // Internal Methods (called by PluginManager)
  

  /**
   * @internal Inject the plugin context. Called by the PluginManager.
   * Do NOT call this directly.
   */
  _setContext(context: PluginContext): void {
    this._context = context;
  }

  /**
   * @internal Update the plugin state. Called by the PluginManager.
   * Do NOT call this directly.
   */
  _setState(state: PluginState): void {
    this._state = state;
  }

  
  // Lifecycle Methods - Override These
  

  /**
   * Called when the plugin is loaded.
   * Use this to set up event listeners, register commands, and initialize state.
   * The PluginContext is available as the first argument and via `this.context`.
   *
   * @remarks Override this to subscribe to events (e.g. `ctx.events.on('game:start', ...)`),
   * register commands (`ctx.commands.register(...)`), and read/write storage.
   * @param context The full plugin context
   */
  onLoad(context: PluginContext): void | Promise<void> {
    // Override in your plugin
  }

  /**
   * Called when the plugin is enabled (after loading).
   * Plugins are auto-enabled after loading.
   *
   * @remarks Override for activation logic that should run once the plugin is live
   * (e.g. starting a background task). Prefer setting up subscriptions in onLoad.
   */
  onEnable(): void | Promise<void> {
    // Override in your plugin
  }

  /**
   * Called when the plugin is disabled.
   *
   * @remarks Override to stop timers, clear intervals, or reset in-memory state.
   * Event listeners and commands are automatically cleaned up by the proxy.
   */
  onDisable(): void | Promise<void> {
    // Override in your plugin
  }

  /**
   * Called when the plugin is being unloaded (proxy shutdown or plugin removal).
   *
   * @remarks Override for final cleanup (e.g. flushing storage). After this,
   * the plugin context is no longer valid; do not use ctx or this.context.
   */
  onUnload(): void | Promise<void> {
    // Override in your plugin
  }

  
  // Metadata
  

  /** Get the plugin's metadata */
  getMetadata(): PluginMetadata {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
    };
  }
}
