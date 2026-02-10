/**
 * Opponent Tracker Plugin
 * Demonstrates: players API, events, chat messages, scheduler
 *
 * Automatically looks up opponent stats when a game starts and
 * displays a summary in chat. Also tracks your W/L against
 * opponents you've faced before using persistent storage.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class OpponentTracker extends Plugin {
  id = 'opponent-tracker';
  name = 'Opponent Tracker';
  description = 'Fetches and displays opponent stats on game start';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // Listen for opponent detection events fired by the proxy
    ctx.events.on('opponent:detected', async (payload) => {
      this.logger.info(`Opponent detected: ${payload.username} (mode: ${payload.mode})`);

      // Fetch their stats via the players API
      const stats = await ctx.players.fetchStatsByUsername(payload.username);
      if (!stats) {
        ctx.client.sendChat(`§7[OT] §cCouldn't fetch stats for §e${payload.username}`);
        return;
      }

      // Build a nice chat message
      const lines: string[] = [`§7[OT] §6${stats.displayname} §7(${stats.rank ?? 'Non'})`];

      if (stats.duels) {
        const d = stats.duels;
        lines.push(`§7  Duels: §a${d.wins}W §c${d.losses}L §f(${d.wlr} WLR) §eWS: ${d.currentWinstreak ?? '?'}`);
      }

      if (stats.bedwars) {
        const b = stats.bedwars;
        lines.push(`§7  BW: §a${b.wins}W §c${b.losses}L §f${b.fkdr} FKDR §e${b.stars}✫`);
      }

      // Check our personal history with this opponent
      const history = ctx.storage.get<Record<string, { wins: number; losses: number }>>(
        'opponent-history'
      ) ?? {};
      const record = history[stats.uuid];
      if (record) {
        lines.push(`§7  History: §a${record.wins}W §c${record.losses}L §7against them`);
      }

      for (const line of lines) {
        ctx.client.sendChat(line);
      }
    });

    // Track game results to build opponent history
    ctx.events.on('game:end', (payload) => {
      if (!payload.opponents || payload.opponents.length === 0) return;

      const history = ctx.storage.get<Record<string, { wins: number; losses: number }>>(
        'opponent-history'
      ) ?? {};

      for (const opponentUuid of payload.opponents) {
        if (!history[opponentUuid]) {
          history[opponentUuid] = { wins: 0, losses: 0 };
        }
        if (payload.result === 'victory') {
          history[opponentUuid].wins++;
        } else if (payload.result === 'defeat') {
          history[opponentUuid].losses++;
        }
      }

      ctx.storage.set('opponent-history', history);
    });

    // Register a command to look up any player's stats
    ctx.commands.register({
      name: 'lookup',
      description: 'Look up a player\'s stats',
      usage: '/lookup <username>',
      aliases: ['lu'],
      execute: async (args) => {
        if (args.length === 0) {
          ctx.client.sendChat('§cUsage: /lookup <username>');
          return;
        }

        const username = args[0]!;
        ctx.client.sendChat(`§7Looking up §e${username}§7...`);

        const stats = await ctx.players.fetchStatsByUsername(username);
        if (!stats) {
          ctx.client.sendChat(`§cPlayer not found: ${username}`);
          return;
        }

        ctx.client.sendChat(`§6§l${stats.displayname} §7(${stats.rank ?? 'Non'}) §8Lv.${stats.networkLevel ?? '?'}`);
        if (stats.duels) {
          ctx.client.sendChat(`§7Duels: §a${stats.duels.wins}W §c${stats.duels.losses}L §f${stats.duels.wlr} WLR §eWS: ${stats.duels.currentWinstreak ?? '?'}`);
        }
        if (stats.bedwars) {
          ctx.client.sendChat(`§7BW: §a${stats.bedwars.wins}W §f${stats.bedwars.fkdr} FKDR §e${stats.bedwars.stars}✫`);
        }
      },
    });
  }

  onEnable() {
    this.logger.info('Opponent Tracker enabled');
  }

  onDisable() {
    this.logger.info('Opponent Tracker disabled');
  }
}
