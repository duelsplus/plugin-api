/**
 * Match Alerts Plugin
 * Demonstrates: events, game state, client (titles/sounds), scheduler, settings
 *
 * Plays sounds and shows titles for important in-game moments:
 * game start countdown, victories, defeats, winstreak milestones.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class MatchAlerts extends Plugin {
  id = 'match-alerts';
  name = 'Match Alerts';
  description = 'Plays sounds and shows titles for game events';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // Game start alert
    ctx.events.on('game:start', (payload) => {
      ctx.client.playSound('random.levelup', 0.5, 1.2);
      ctx.client.sendTitle(
        '§a§lGAME START',
        `§7${payload.mode} §8- §7${payload.map ?? 'Unknown Map'}`,
        { fadeIn: 5, stay: 40, fadeOut: 10 }
      );
    });

    // Victory alert with winstreak milestone check
    ctx.events.on('game:victory', (payload) => {
      const session = ctx.stats.getSessionStats();
      const ws = session?.currentWinstreak ?? 0;

      // Milestone winstreaks get special treatment
      if (ws > 0 && ws % 5 === 0) {
        ctx.client.playSound('mob.enderdragon.growl', 0.8, 1.0);
        ctx.client.sendTitle(
          `§6§l${ws} WINSTREAK!`,
          `§eYou're on fire! §7(${payload.mode})`,
          { fadeIn: 5, stay: 60, fadeOut: 15 }
        );
      } else {
        ctx.client.playSound('random.levelup', 1.0, 1.5);
        ctx.client.sendTitle(
          '§a§lVICTORY',
          ws > 1 ? `§eWinstreak: ${ws}` : undefined,
          { fadeIn: 5, stay: 40, fadeOut: 10 }
        );
      }

      // Auto-requeue after a delay if the setting is stored
      const autoRequeue = ctx.storage.get<boolean>('autoRequeue') ?? false;
      if (autoRequeue) {
        const delay = ctx.storage.get<number>('requeueDelay') ?? 3000;
        ctx.scheduler.setTimeout(() => {
          // Only requeue if we're not already in a game
          if (!ctx.gameState.isInGame()) {
            const mode = ctx.gameState.locraw.mode;
            if (mode) {
              ctx.client.sendGameChat(`/play ${mode}`);
            }
          }
        }, delay);
      }
    });

    // Defeat alert
    ctx.events.on('game:defeat', () => {
      ctx.client.playSound('mob.villager.death', 0.8, 0.8);
    });

    // Lobby join — gentle notification
    ctx.events.on('lobby:join', (payload) => {
      if (payload.gametype === 'DUELS') {
        ctx.client.playSound('note.harp', 0.3, 1.0);
      }
    });

    // Server change awareness
    ctx.events.on('server:change', (payload) => {
      this.logger.debug(`Server changed: ${payload.previous?.server ?? 'none'} → ${payload.data.server}`);
    });

    // Command to configure
    ctx.commands.register({
      name: 'alerts',
      description: 'Configure match alerts',
      usage: '/alerts [requeue on|off|delay <ms>]',
      execute: (args) => {
        const sub = args[0]?.toLowerCase();

        if (sub === 'requeue') {
          const action = args[1]?.toLowerCase();
          if (action === 'on') {
            ctx.storage.set('autoRequeue', true);
            ctx.client.sendChat('§7[Alerts] Auto-requeue §aenabled');
            return;
          }
          if (action === 'off') {
            ctx.storage.set('autoRequeue', false);
            ctx.client.sendChat('§7[Alerts] Auto-requeue §cdisabled');
            return;
          }
          if (action === 'delay') {
            const ms = parseInt(args[2] ?? '', 10);
            if (isNaN(ms) || ms < 1000 || ms > 30000) {
              ctx.client.sendChat('§cDelay must be between 1000 and 30000 ms');
              return;
            }
            ctx.storage.set('requeueDelay', ms);
            ctx.client.sendChat(`§7[Alerts] Requeue delay set to §e${ms}ms`);
            return;
          }
        }

        const autoRequeue = ctx.storage.get<boolean>('autoRequeue') ?? false;
        const delay = ctx.storage.get<number>('requeueDelay') ?? 3000;
        const session = ctx.stats.getSessionStats();

        ctx.client.sendChat('§7§m           §r §6Match Alerts §7§m           ');
        ctx.client.sendChat(`§7Auto-requeue: ${autoRequeue ? '§aON' : '§cOFF'} §7(${delay}ms delay)`);
        if (session) {
          ctx.client.sendChat(`§7Session: §a${session.wins}W §c${session.losses}L §eWS: ${session.currentWinstreak}`);
        }
      },
    });
  }
}
