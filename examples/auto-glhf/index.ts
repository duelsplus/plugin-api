/**
 * Auto GLHF Plugin
 * Demonstrates: events, scheduler, client chat, game state, storage
 *
 * Sends a customizable "glhf" message once an opponent is detected
 * (meaning the game has fully loaded). Configurable message and delay.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class AutoGLHF extends Plugin {
  id = 'auto-glhf';
  name = 'Auto GLHF';
  description = 'Sends a glhf message when a game starts';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;
  // Track whether we already sent glhf for the current game
  private sentThisGame = false;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // Reset the flag when a new game starts
    ctx.events.on('game:start', () => {
      this.sentThisGame = false;
    });

    // Send glhf once the opponent is detected - the game is actually running
    ctx.events.on('opponent:detected', () => {
      if (this.sentThisGame) return; // Only send once per game
      this.sentThisGame = true;

      const enabled = ctx.storage.get<boolean>('enabled') ?? true;
      if (!enabled) return;

      const allowPrivate = ctx.storage.get<boolean>('allowPrivate') ?? false;
      if (!allowPrivate && ctx.gameState.isPrivateMatch) return;

      const message = ctx.storage.get<string>('message') ?? 'glhf';
      const delay = ctx.storage.get<number>('delay') ?? 500;

      this.logger.info(`Opponent detected, sending "${message}" in ${delay}ms`);

      ctx.scheduler.setTimeout(() => {
        ctx.client.sendGameChat(message);
      }, delay);
    });

    // Also reset on lobby join (in case game:start didn't fire)
    ctx.events.on('lobby:join', () => {
      this.sentThisGame = false;
    });

    ctx.commands.register({
      name: 'glhf',
      description: 'Configure auto-glhf',
      usage: '/glhf [on|off|set <message>|delay <ms>]',
      execute: (args) => {
        const sub = args[0]?.toLowerCase();

        if (sub === 'on') {
          ctx.storage.set('enabled', true);
          ctx.client.sendChat('§7[GLHF] §aEnabled');
          return;
        }
        if (sub === 'off') {
          ctx.storage.set('enabled', false);
          ctx.client.sendChat('§7[GLHF] §cDisabled');
          return;
        }
        if (sub === 'set') {
          const msg = args.slice(1).join(' ');
          if (!msg) {
            ctx.client.sendChat('§cUsage: /glhf set <message>');
            return;
          }
          ctx.storage.set('message', msg);
          ctx.client.sendChat(`§7[GLHF] Message set to: §f${msg}`);
          return;
        }
        if (sub === 'delay') {
          const ms = parseInt(args[1] ?? '', 10);
          if (isNaN(ms) || ms < 0 || ms > 10000) {
            ctx.client.sendChat('§cDelay must be between 0 and 10000 ms');
            return;
          }
          ctx.storage.set('delay', ms);
          ctx.client.sendChat(`§7[GLHF] Delay set to §e${ms}ms`);

          return;
        }

        // Show status
        const enabled = ctx.storage.get<boolean>('enabled') ?? true;
        const message = ctx.storage.get<string>('message') ?? 'glhf';
        const delay = ctx.storage.get<number>('delay') ?? 500;
        ctx.client.sendChat(`§7[GLHF] ${enabled ? '§aON' : '§cOFF'} §7| Message: §f${message} §7| Delay: §e${delay}ms`);
      },
    });
  }
}
