/**
 * Game Logger Plugin
 * Demonstrates: events, storage, game state, stats, commands, scoreboard
 *
 * Logs every game you play with details (mode, map, result, opponent,
 * game phase transitions). View your history with /gamelog.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

interface GameLogRecord {
  timestamp: number;
  mode: string;
  map: string;
  result: string;
  duration: number;
  opponents: string[];
  wasPrivate: boolean;
}

export default class GameLogger extends Plugin {
  id = 'game-logger';
  name = 'Game Logger';
  description = 'Records game history with detailed stats';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // Log game start with team info
    ctx.events.on('game:start', (payload) => {
      this.logger.info(`Game started: ${payload.mode} on ${payload.map ?? 'unknown map'}`);

      // Show scoreboard teams for debugging/info
      const teams = ctx.scoreboard.getTeams();
      if (teams.length > 0) {
        this.logger.debug(`Teams in game: ${teams.map((t) => `${t.name}(${t.players.join(',')})`).join(', ')}`);
      }

      // Notify the player
      const phase = ctx.gameState.getGamePhase();
      const bridge = ctx.gameState.bridgeTeam;
      let msg = `§7[Log] §aGame started §7- ${payload.mode}`;
      if (bridge) msg += ` §7(Team: §${bridge === 'red' ? 'c' : '9'}${bridge}§7)`;
      if (phase !== 'unknown') msg += ` §8[${phase}]`;
      ctx.client.sendChat(msg);
    });

    // Record game results
    ctx.events.on('game:end', (payload) => {
      const log = ctx.storage.get<GameLogRecord[]>('games') ?? [];

      // Get opponent info from the players API
      const opponents = ctx.players.getOpponents().map((p) => p.username || p.uuid);

      log.push({
        timestamp: Date.now(),
        mode: payload.mode,
        map: payload.map,
        result: payload.result,
        duration: payload.duration,
        opponents,
        wasPrivate: ctx.gameState.isPrivateMatch,
      });

      // Keep only the last 200 games
      if (log.length > 200) {
        log.splice(0, log.length - 200);
      }

      ctx.storage.set('games', log);

      const resultColor = payload.result === 'victory' ? '§a' : payload.result === 'defeat' ? '§c' : '§e';
      ctx.client.sendChat(
        `§7[Log] ${resultColor}${payload.result.toUpperCase()} §7- ${payload.mode} §7on ${payload.map} §8(${formatDuration(payload.duration)})`
      );
    });

    // Track mode changes
    ctx.events.on('mode:change', (payload) => {
      this.logger.debug(`Mode changed: ${payload.previousMode ?? 'none'} → ${payload.newMode}`);
    });

    // Track lobby joins
    ctx.events.on('lobby:join', (payload) => {
      this.logger.debug(`Joined lobby: ${payload.gametype} - ${payload.lobbyname}`);
    });

    // Command to view game history
    ctx.commands.register({
      name: 'gamelog',
      description: 'View your game history',
      usage: '/gamelog [count] [mode]',
      aliases: ['gl'],
      execute: (args) => {
        const log = ctx.storage.get<GameLogRecord[]>('games') ?? [];

        if (log.length === 0) {
          ctx.client.sendChat('§7[Log] No games recorded yet.');
          return;
        }

        let count = parseInt(args[0] ?? '5', 10);
        if (isNaN(count) || count < 1) count = 5;
        count = Math.min(count, 20);

        const modeFilter = args[1]?.toUpperCase();
        let filtered = log;
        if (modeFilter) {
          filtered = log.filter((g) => g.mode.toUpperCase().includes(modeFilter));
        }

        const recent = filtered.slice(-count).reverse();

        ctx.client.sendChat(`§7§m              §r §6Game Log §7(${filtered.length} total) §7§m              `);

        for (const game of recent) {
          const resultColor = game.result === 'victory' ? '§a' : game.result === 'defeat' ? '§c' : '§e';
          const time = new Date(game.timestamp).toLocaleTimeString();
          const opps = game.opponents.length > 0 ? ` vs ${game.opponents.join(', ')}` : '';
          ctx.client.sendChat(
            `§7${time} ${resultColor}${game.result.substring(0, 1).toUpperCase()} §f${game.mode} §7${game.map}${opps} §8(${formatDuration(game.duration)})`
          );
        }

        // Show session/daily summary
        const session = ctx.stats.getSessionStats();
        const daily = ctx.stats.getDailyStats();
        if (session) {
          ctx.client.sendChat(`§7Session: §a${session.wins}W §c${session.losses}L §f${session.wlr} WLR §eWS: ${session.currentWinstreak}`);
        }
        if (daily) {
          ctx.client.sendChat(`§7Daily: §a${daily.wins}W §c${daily.losses}L §f${daily.wlr} WLR`);
        }
      },
    });

    // Command to clear log
    ctx.commands.register({
      name: 'gamelogclear',
      description: 'Clear your game history',
      usage: '/gamelogclear',
      aliases: ['glclear'],
      execute: () => {
        ctx.storage.delete('games');
        ctx.client.sendChat('§7[Log] Game history cleared.');
      },
    });
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m${seconds.toString().padStart(2, '0')}s`;
}
