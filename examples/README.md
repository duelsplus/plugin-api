# Plugin Examples

Example plugins demonstrating the `@duelsplus/plugin-api` capabilities.

## Examples

### [opponent-tracker](./opponent-tracker/)
Fetches and displays opponent stats when a game starts. Tracks your personal W/L record against each opponent using persistent storage.

**API used:** `players.fetchStatsByUsername()`, `events.on('opponent:detected')`, `storage`, `commands.register()`

### [session-overlay](./session-overlay/)
Shows your session stats on the action bar while in-game, with configurable update interval.

**API used:** `stats.getSessionStats()`, `stats.getDailyStats()`, `scheduler.setInterval()`, `client.sendActionBar()`, `gameState.isInGame()`

### [auto-glhf](./auto-glhf/)
Sends a customizable "glhf" message at the start of each game with configurable delay.

**API used:** `events.on('game:start')`, `scheduler.setTimeout()`, `client.sendGameChat()`, `gameState.isPrivateMatch`, `storage`

### [game-logger](./game-logger/)
Records every game with details (mode, map, result, opponents, duration). View history with `/gamelog`.

**API used:** `events`, `players.getOpponents()`, `scoreboard.getTeams()`, `stats`, `storage`, `gameState.getGamePhase()`, `gameState.bridgeTeam`

### [lobby-spy](./lobby-spy/)
Scans lobby players for stats and alerts when high-WLR opponents are detected with a title and sound.

**API used:** `players.getLobbyPlayers()`, `players.fetchStatsByUsername()`, `scoreboard.getPlayerTeam()`, `settings.onChange()`, `packets.onClientbound()`, `client.sendTitle()`, `client.playSound()`

### [match-alerts](./match-alerts/)
Plays sounds and titles for game events: starts, victories, defeats, winstreak milestones. Optional auto-requeue.

**API used:** `events` (victory/defeat/lobby), `stats.getSessionStats()`, `scheduler.setTimeout()`, `client.playSound()`, `client.sendTitle()`, `client.sendGameChat()`

## Creating Your Own Plugin

1. Create a new directory in `~/.duelsplus/plugins/`
2. Add a `package.json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "main": "index.js",
  "duelsplus": {
    "id": "my-plugin",
    "name": "My Plugin"
  }
}
```

3. Install the API for types: `npm install @duelsplus/plugin-api`
4. Write your plugin extending the `Plugin` class
5. Compile to JS and place in the plugin directory
6. Restart the proxy and your plugin will be auto-loaded