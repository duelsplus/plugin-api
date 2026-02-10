/**
 * Lobby Spy Plugin
 * Demonstrates: players API, scoreboard, events, packets, settings API
 *
 * When in a Duels lobby, shows information about lobby players — their
 * stats, winstreak, and client type. Watches for high-threat opponents
 * and alerts you with a title + sound.
 */
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class LobbySpy extends Plugin {
  id = 'lobby-spy';
  name = 'Lobby Spy';
  description = 'Scouts lobby players and alerts on high-WLR opponents';
  version = '1.0.0';
  author = 'DuelsPlus';

  private ctx!: PluginContext;

  onLoad(ctx: PluginContext) {
    this.ctx = ctx;

    // When we join a lobby, scan the players after a brief delay
    ctx.events.on('lobby:join', (payload) => {
      if (payload.gametype !== 'DUELS') return;

      ctx.scheduler.setTimeout(() => {
        this.scanLobby();
      }, 2000); // Wait for player list to populate
    });

    // Listen for opponent:detected to get instant alerts even in-game
    ctx.events.on('opponent:stats', (payload) => {
      const threshold = ctx.storage.get<number>('alertThreshold') ?? 5;

      if (payload.stats.wlr >= threshold) {
        ctx.client.sendTitle(
          `§c§lHIGH WLR`,
          `§e${payload.username} §7- §c${payload.stats.wlr} WLR §7(WS: ${payload.stats.winstreak ?? '?'})`,
          { fadeIn: 5, stay: 60, fadeOut: 10 }
        );
        ctx.client.playSound('note.pling', 1.0, 2.0);
      }
    });

    // Listen for scoreboard changes via packets to detect player joins
    ctx.packets.onClientbound('scoreboard_team', (data) => {
      // This is read-only observation — just log for debugging
      const packet = data as { team?: string; mode?: number; players?: string[] };
      if (packet.mode === 3 && packet.players) {
        this.logger.debug(`Players added to team ${packet.team}: ${packet.players.join(', ')}`);
      }
    });

    // Command to scout a specific player or configure alerts
    ctx.commands.register({
      name: 'spy',
      description: 'Scout lobby players or configure alerts',
      usage: '/spy [scan|threshold <wlr>|<username>]',
      execute: async (args) => {
        const sub = args[0]?.toLowerCase();

        if (!sub || sub === 'scan') {
          await this.scanLobby();
          return;
        }

        if (sub === 'threshold') {
          const val = parseFloat(args[1] ?? '');
          if (isNaN(val) || val < 0) {
            ctx.client.sendChat('§cUsage: /spy threshold <wlr>');
            return;
          }
          ctx.storage.set('alertThreshold', val);
          ctx.client.sendChat(`§7[Spy] Alert threshold set to §e${val} WLR`);
          return;
        }

        // Look up a specific player
        ctx.client.sendChat(`§7[Spy] Scouting §e${sub}§7...`);
        const stats = await ctx.players.fetchStatsByUsername(sub);
        if (!stats) {
          ctx.client.sendChat(`§cPlayer not found: ${sub}`);
          return;
        }

        this.displayPlayerCard(stats);
      },
    });

    // Watch for settings changes (e.g., if user changes autoStats via GUI)
    ctx.settings.onChange((key, _old, newVal) => {
      if (key === 'autoStats') {
        this.logger.info(`autoStats setting changed to: ${newVal}`);
      }
    });
  }

  private async scanLobby() {
    const lobbyPlayers = this.ctx.players.getLobbyPlayers();

    if (lobbyPlayers.length === 0) {
      this.ctx.client.sendChat('§7[Spy] No lobby players detected yet.');
      return;
    }

    this.ctx.client.sendChat(`§7[Spy] Scanning §e${lobbyPlayers.length} §7lobby players...`);

    // Fetch stats for each player (up to 10 to avoid rate limits)
    const toScan = lobbyPlayers.slice(0, 10);

    for (const username of toScan) {
      // Skip self
      if (username.toLowerCase() === this.ctx.client.username.toLowerCase()) continue;

      const stats = await this.ctx.players.fetchStatsByUsername(username);
      if (!stats || !stats.duels) continue;

      const wlr = stats.duels.wlr;
      const ws = stats.duels.currentWinstreak ?? 0;
      const color = wlr >= 5 ? '§c' : wlr >= 2 ? '§e' : '§a';

      this.ctx.client.sendChat(
        `§7[Spy] ${color}${stats.displayname} §7- ${color}${wlr} WLR §7WS: §e${ws} §7(${stats.rank ?? 'Non'})`
      );
    }
  }

  private displayPlayerCard(stats: {
    displayname: string;
    uuid: string;
    rank?: string;
    networkLevel?: number;
    duels?: { wins: number; losses: number; wlr: number; kills: number; deaths: number; currentWinstreak?: number; bestWinstreak?: number };
    bedwars?: { wins: number; losses: number; fkdr: number; stars: number; finalKills: number; bedsBroken: number };
  }) {
    this.ctx.client.sendChat('§7§m                                                    ');
    this.ctx.client.sendChat(`§6§l${stats.displayname} §7(${stats.rank ?? 'Non'}) §8Lv.${stats.networkLevel ?? '?'}`);

    if (stats.duels) {
      const d = stats.duels;
      this.ctx.client.sendChat(`§7  §fDuels: §a${d.wins}W §c${d.losses}L §f${d.wlr} WLR`);
      this.ctx.client.sendChat(`§7  §fK/D: §a${d.kills}§7/§c${d.deaths} §7| WS: §e${d.currentWinstreak ?? '?'} §7Best: §6${d.bestWinstreak ?? '?'}`);
    }

    if (stats.bedwars) {
      const b = stats.bedwars;
      this.ctx.client.sendChat(`§7  §fBW ${b.stars}✫: §a${b.wins}W §c${b.losses}L §f${b.fkdr} FKDR §7Beds: §a${b.bedsBroken}`);
    }

    // Check what team they're on
    const team = this.ctx.scoreboard.getPlayerTeam(stats.displayname);
    if (team) {
      this.ctx.client.sendChat(`§7  Team: §f${team.name} §7[${team.prefix}${stats.displayname}${team.suffix}§7]`);
    }

    this.ctx.client.sendChat('§7§m                                                    ');
  }
}
