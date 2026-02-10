/**
 * Session Overlay Plugin
 * Demonstrates: stats API, scheduler, action bar, settings
 *
 * Continuously shows your session stats on the action bar while
 * you're in a game. Configurable update interval via a command.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class SessionOverlay extends Plugin {
  id = 'session-overlay';
  name = 'Session Overlay';
  description = 'Shows session stats on the action bar in-game';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;
  private intervalId: number | null = null;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // Start the overlay when a game starts
    ctx.events.on('game:start', () => {
      this.startOverlay();
    });

    // Stop when leaving a game
    ctx.events.on('lobby:join', () => {
      this.stopOverlay();
    });

    ctx.events.on('client:disconnected', () => {
      this.stopOverlay();
    });

    // Register a command to toggle the overlay and configure interval
    ctx.commands.register({
      name: 'overlay',
      description: 'Configure the session overlay',
      usage: '/overlay [on|off|interval <ms>]',
      execute: (args) => {
        const sub = args[0]?.toLowerCase();

        if (sub === 'off') {
          this.stopOverlay();
          ctx.client.sendChat('§7[Overlay] §cDisabled');
          ctx.storage.set('enabled', false);
          return;
        }

        if (sub === 'on') {
          ctx.storage.set('enabled', true);
          ctx.client.sendChat('§7[Overlay] §aEnabled');
          if (ctx.gameState.isInGame()) {
            this.startOverlay();
          }
          return;
        }

        if (sub === 'interval' && args[1]) {
          const ms = parseInt(args[1], 10);
          if (isNaN(ms) || ms < 500 || ms > 10000) {
            ctx.client.sendChat('§cInterval must be between 500 and 10000 ms');
            return;
          }
          ctx.storage.set('interval', ms);
          ctx.client.sendChat(`§7[Overlay] Interval set to §e${ms}ms`);
          // Restart if running
          if (this.intervalId !== null) {
            this.stopOverlay();
            this.startOverlay();
          }
          return;
        }

        // Show current status
        const enabled = ctx.storage.get<boolean>('enabled') ?? true;
        const interval = ctx.storage.get<number>('interval') ?? 2000;
        ctx.client.sendChat(`§7[Overlay] Status: ${enabled ? '§aON' : '§cOFF'} §7| Interval: §e${interval}ms`);
      },
    });
  }

  private startOverlay() {
    if (this.intervalId !== null) return; // Already running
    const enabled = this.ctx.storage.get<boolean>('enabled') ?? true;
    if (!enabled) return;

    const interval = this.ctx.storage.get<number>('interval') ?? 2000;

    this.intervalId = this.ctx.scheduler.setInterval(() => {
      if (!this.ctx.gameState.isInGame()) {
        this.stopOverlay();
        return;
      }

      const session = this.ctx.stats.getSessionStats();
      if (!session) return;

      const daily = this.ctx.stats.getDailyStats();
      const mode = this.ctx.gameState.currentMode ?? 'Unknown';

      let bar = `§a${session.wins}W §c${session.losses}L §f${session.wlr} WLR §eWS: ${session.currentWinstreak}`;

      if (daily) {
        bar += ` §8| §7Daily: §a${daily.wins}W §c${daily.losses}L`;
      }

      bar += ` §8| §d${mode}`;

      this.ctx.client.sendActionBar(bar);
    }, interval);
  }

  private stopOverlay() {
    if (this.intervalId !== null) {
      this.ctx.scheduler.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onDisable() {
    this.stopOverlay();
  }
}
