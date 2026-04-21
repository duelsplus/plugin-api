/**
 * Plugin API type definitions.
 * All types, interfaces, and contracts for the Duels+ Plugin System.
 * See {@link PluginContext} for the main API surface; event payloads are keyed by {@link PluginEventName}.
 *
 * @packageDocumentation
 * @module @duelsplus/plugin-api/types
 */

// Game State Types

/** Hypixel /locraw response data */
export interface LocrawData {
    /** Server identifier (e.g., "mini123A") */
    server: string;
    /** Game type (e.g., "DUELS", "BEDWARS") */
    gametype?: string;
    /** Lobby name - only set when in a lobby */
    lobbyname?: string;
    /** Game mode (e.g., "DUELS_UHC_DUEL") */
    mode?: string;
    /** Map name - only set when in a game */
    map?: string;
}

/** Game result type */
export type GameResult = "victory" | "defeat" | "draw" | "unknown";

/** Game phase type */
export type GamePhase = "pregame" | "ingame" | "postgame" | "lobby" | "unknown";

// Player & Stats Types

/** Basic player information */
export interface PlayerInfo {
    /** Player's username */
    username: string;
    /** Player's UUID */
    uuid: string;
}

/** Normalized Hypixel player stats returned by the Players API */
export interface HypixelPlayerStats {
    /** Player's display name */
    displayname: string;
    /** Player's UUID */
    uuid: string;
    /** Player's rank (e.g., "MVP+", "VIP", "ADMIN") */
    rank?: string;
    /** Duels stats (if available) */
    duels?: {
        wins: number;
        losses: number;
        kills: number;
        deaths: number;
        wlr: number;
        currentWinstreak?: number;
        bestWinstreak?: number;
    };
    /** Bedwars stats (if available) */
    bedwars?: {
        wins: number;
        losses: number;
        finalKills: number;
        finalDeaths: number;
        fkdr: number;
        bedsBroken: number;
        bedsLost: number;
        stars: number;
    };
    /** Hypixel network level */
    networkLevel?: number;
    /** Raw Hypixel API data (for advanced use) */
    raw?: Record<string, unknown>;
}

/** Session stats snapshot */
export interface SessionStats {
    /** Number of wins this session */
    wins: number;
    /** Number of losses this session */
    losses: number;
    /** Win/loss ratio */
    wlr: number;
    /** Current consecutive wins */
    currentWinstreak: number;
    /** Best winstreak achieved this session */
    bestWinstreak: number;
    /** Total games played this session */
    gamesPlayed: number;
    /** Session duration in milliseconds */
    sessionDuration: number;
}

/** Daily stats snapshot */
export interface DailyStatsSnapshot {
    /** Number of wins today */
    wins: number;
    /** Number of losses today */
    losses: number;
    /** Win/loss ratio */
    wlr: number;
    /** Current consecutive wins */
    currentWinstreak: number;
    /** Best winstreak today */
    bestWinstreak: number;
}

/** A single game entry from the session game log */
export interface GameLogEntry {
    /** Timestamp when the game was recorded */
    timestamp: number;
    /** Game mode (e.g. "DUELS_UHC_DUEL") */
    mode: string;
    /** Result of the game */
    result: "win" | "loss" | "draw" | "unknown";
}

/** Scoreboard team information */
export interface TeamInfo {
    /** Team name (internal identifier) */
    name: string;
    /** Team prefix (displayed before player name) */
    prefix: string;
    /** Team suffix (displayed after player name) */
    suffix: string;
    /** Team color code */
    color?: number;
    /** Players in this team */
    players: string[];
}

// Plugin Event Types

/** All event names available to plugins */
export type PluginEventName =
    | "proxy:ready"
    | "client:connected"
    | "client:disconnected"
    | "game:start"
    | "game:end"
    | "game:victory"
    | "game:defeat"
    | "game:join"
    | "game:leave"
    | "lobby:join"
    | "lobby:leave"
    | "locraw:update"
    | "server:change"
    | "mode:change"
    | "opponent:detected"
    | "opponent:stats";

/** Base event payload - all events include a timestamp */
export interface BaseEventPayload {
    timestamp: number;
}

/** Payload for client:connected */
export interface ClientConnectedPayload extends BaseEventPayload {
    username: string;
    uuid: string;
}

/** Payload for client:disconnected */
export interface ClientDisconnectedPayload extends BaseEventPayload {
    username: string;
    reason?: string;
}

/** Payload for game:start. @see PluginEventName "game:start" */
export interface GameStartPayload extends BaseEventPayload {
    mode: string;
    map?: string;
    gametype: string;
    server: string;
}

/** Payload for game:end, game:victory, game:defeat. @see PluginEventName */
export interface GameEndPayload extends BaseEventPayload {
    mode: string;
    map: string;
    result: GameResult;
    duration: number;
    opponents?: string[];
}

/** Payload for lobby:join */
export interface LobbyJoinPayload extends BaseEventPayload {
    gametype: string;
    lobbyname: string;
    server: string;
}

/** Payload for locraw:update and server:change */
export interface LocrawUpdatePayload extends BaseEventPayload {
    data: LocrawData;
    previous?: LocrawData;
}

/** Payload for opponent:detected. @see PluginEventName "opponent:detected" */
export interface OpponentDetectedPayload extends BaseEventPayload {
    /** Opponent's username */
    username: string;
    /** Opponent's UUID (may not be available yet) */
    uuid?: string;
    /** Current game mode */
    mode: string;
}

/** Payload for opponent:stats */
export interface OpponentStatsPayload extends BaseEventPayload {
    /** Opponent's username */
    username: string;
    /** Opponent's UUID */
    uuid: string;
    /** Current game mode */
    mode: string;
    /** Opponent's stats */
    stats: {
        wins: number;
        losses: number;
        wlr: number;
        winstreak?: number;
    };
}

/** Payload for mode:change */
export interface ModeChangePayload extends BaseEventPayload {
    /** New game mode */
    newMode: string;
    /** Previous game mode (null if none) */
    previousMode: string | null;
}

/** Payload for game:join */
export interface GameJoinPayload extends BaseEventPayload {
    /** Game mode */
    mode: string;
    /** Map name (if available) */
    map?: string;
    /** Game type (e.g. "DUELS") */
    gametype: string;
    /** Server identifier */
    server: string;
}

/** Payload for game:leave */
export interface GameLeavePayload extends BaseEventPayload {
    /** Game mode */
    mode: string;
    /** Game result (if available) */
    result?: GameResult;
    /** Duration in ms (if available) */
    duration?: number;
}

/** Map of event names to their payload types */
export interface PluginEventPayloadMap {
    "proxy:ready": BaseEventPayload;
    "client:connected": ClientConnectedPayload;
    "client:disconnected": ClientDisconnectedPayload;
    "game:start": GameStartPayload;
    "game:end": GameEndPayload;
    "game:victory": GameEndPayload;
    "game:defeat": GameEndPayload;
    "game:join": GameJoinPayload;
    "game:leave": GameLeavePayload;
    "lobby:join": LobbyJoinPayload;
    "lobby:leave": BaseEventPayload;
    "locraw:update": LocrawUpdatePayload;
    "server:change": LocrawUpdatePayload;
    "mode:change": ModeChangePayload;
    "opponent:detected": OpponentDetectedPayload;
    "opponent:stats": OpponentStatsPayload;
}

/** Type-safe event handler */
export type PluginEventHandler<E extends PluginEventName> = (
    payload: PluginEventPayloadMap[E],
) => void | Promise<void>;

// Plugin API Interfaces

/**
 * Event subscription API.
 * Subscribe to proxy lifecycle, game, and connection events. Handlers are type-safe:
 * the payload type is inferred from the event name via {@link PluginEventName} and {@link PluginEventPayloadMap}.
 */
export interface PluginEvents {
    /**
     * Subscribe to an event.
     * @param event - Event name (e.g. "game:start", "opponent:detected")
     * @param handler - Callback receiving the typed payload for that event
     */
    on<E extends PluginEventName>(
        event: E,
        handler: PluginEventHandler<E>,
    ): void;
    /**
     * Subscribe to an event (fires once then auto-removes).
     * @param event - Event name
     * @param handler - Callback receiving the typed payload
     */
    once<E extends PluginEventName>(
        event: E,
        handler: PluginEventHandler<E>,
    ): void;
    /**
     * Unsubscribe from an event.
     * @param event - Event name
     * @param handler - The same function reference passed to on() or once()
     */
    off<E extends PluginEventName>(
        event: E,
        handler: PluginEventHandler<E>,
    ): void;
}

/** Title display options */
export interface TitleOptions {
    /** Fade in time in ticks (default: 10) */
    fadeIn?: number;
    /** Stay time in ticks (default: 70) */
    stay?: number;
    /** Fade out time in ticks (default: 20) */
    fadeOut?: number;
}

/**
 * Client & chat operations
 * Send packets, messages, titles, sounds to the player's Minecraft client.
 * Also provides a way to send chat messages to the server (as the player).
 */
export interface PluginClient {
    /** Player's username (empty string if not connected) */
    readonly username: string;
    /** Player's UUID (empty string if not connected) */
    readonly uuid: string;
    /** Whether a player is currently connected */
    readonly isConnected: boolean;

    /** Send a chat message to the player (appears as if the server sent it) */
    sendChat(message: string | object): void;
    /** Send a chat message to the server as the player (e.g. "glhf", "/play duels") */
    sendGameChat(message: string): void;
    /**
     * Send a title and optional subtitle to the player.
     * @param title - Main title text (supports § color codes)
     * @param subtitle - Optional subtitle text
     * @param options - Optional fadeIn, stay, fadeOut (in ticks)
     */
    sendTitle(title: string, subtitle?: string, options?: TitleOptions): void;
    /** Send an action bar message to the player */
    sendActionBar(message: string): void;
    /**
     * Play a sound to the player.
     * @param name - Sound resource name (e.g. "random.levelup", "mob.villager.death")
     * @param volume - Volume 0–1 (default 1)
     * @param pitch - Pitch multiplier (default 1)
     */
    playSound(name: string, volume?: number, pitch?: number): void;
    /** Send any arbitrary packet to the player's client (advanced) */
    sendPacket(name: string, data: unknown): void;
    /** Send any arbitrary packet to the server (advanced) */
    sendServerPacket(name: string, data: unknown): void;
    /** Disconnect the player from the proxy */
    disconnect(reason?: string): void;
}

/**
 * Game state access
 * Query the current server, game mode, lobby, and player settings.
 */
export interface PluginGameState {
    /** Current /locraw data (server, mode, map, etc.) */
    readonly locraw: Readonly<LocrawData>;
    /** Whether a player is currently connected */
    readonly isConnected: boolean;
    /** Current game mode (e.g., "DUELS_UHC_DUEL") or null */
    readonly currentMode: string | null;
    /** Current map name or null */
    readonly currentMap: string | null;
    /** Current game type (e.g., "DUELS", "BEDWARS") or null */
    readonly currentGametype: string | null;
    /** Whether the current game is a private match */
    readonly isPrivateMatch: boolean;
    /** Bridge team color (for Bridge/Bedwars Duels) or null */
    readonly bridgeTeam: "red" | "blue" | null;

    /** Check if the player is currently in an active game */
    isInGame(): boolean;
    /** Check if the player is in a lobby */
    isInLobby(): boolean;
    /** Check if the player is in limbo */
    isInLimbo(): boolean;
    /** Check if the player is in a Duels game/lobby */
    isInDuels(): boolean;
    /** Check if the player is in a Bedwars game/lobby */
    isInBedwars(): boolean;
    /** Get the current game phase (pregame, ingame, postgame, lobby, unknown) */
    getGamePhase(): GamePhase;

    /**
     * Read a user setting value (e.g. "autoStats", "pearlTimer").
     * @param key - Setting key
     */
    getSetting(key: string): unknown;
    /**
     * Read a value from the runtime cache (proxy-internal key-value store).
     * @param key - Cache key
     */
    getCache(key: string): unknown;
}

/**
 * Plugin command definition.
 * Commands are invoked by the player as /commandname; the proxy routes them to the plugin's execute.
 */
export interface PluginCommandDefinition {
    /** Command name (e.g. "myplugin" for /myplugin) */
    name: string;
    /** Description shown in help */
    description: string;
    /** Usage syntax shown in help (e.g. "/myplugin <action> [args]") */
    usage?: string;
    /** Alternative names for this command (e.g. ["mp"] for /mp) */
    aliases?: string[];
    /**
     * Execute the command.
     * @param args - Arguments after the command name (e.g. /myplugin on → ["on"])
     * @param sender - The player who ran the command (username, uuid)
     */
    execute: (
        args: string[],
        sender: { username: string; uuid: string },
    ) => void | Promise<void>;
}

/**
 * Command registration API
 * Register custom chat commands accessible via /commandname.
 */
export interface PluginCommands {
    /** Register a chat command */
    register(command: PluginCommandDefinition): void;
    /** Unregister a previously registered command */
    unregister(name: string): void;
}

/**
 * Persistent per-plugin key-value storage.
 * Data is stored in `~/.duelsplus/plugins/<plugin-id>/storage.json` and persists across proxy restarts.
 * Values must be JSON-serializable (objects, arrays, primitives).
 */
export interface PluginStorage {
    /** Get a stored value by key */
    get<T = unknown>(key: string): T | undefined;
    /** Store a value by key (persisted to disk) */
    set<T = unknown>(key: string, value: T): void;
    /** Delete a stored value */
    delete(key: string): boolean;
    /** Check if a key exists */
    has(key: string): boolean;
    /** Clear all stored data */
    clear(): void;
    /** Get all stored key-value pairs */
    getAll(): Record<string, unknown>;
}

/** Packet metadata */
export interface PacketMeta {
    /** Packet name (e.g., "chat", "player_info") */
    name: string;
    /** Protocol state */
    state: string;
}

/** Packet listener handler function */
export type PacketListenerHandler = (data: unknown, meta: PacketMeta) => void;

/**
 * Read-only packet listening API.
 * Observe packets flowing between the client and server. Listeners are read-only - you cannot modify or cancel packets.
 * Fast-path packets (movement, combat, chunks, etc.) are NOT observable for performance; only processed packets are visible.
 */
export interface PluginPackets {
    /**
     * Listen to a packet from the server (Hypixel → player).
     * @param packetName - Packet name (e.g. "chat", "player_info")
     * @param handler - Callback (data, meta) where meta has name and state
     */
    onClientbound(packetName: string, handler: PacketListenerHandler): void;
    /**
     * Listen to a packet from the client (player → Hypixel).
     * @param packetName - Packet name
     * @param handler - Callback (data, meta)
     */
    onServerbound(packetName: string, handler: PacketListenerHandler): void;
    /** Remove a clientbound packet listener (same handler reference as onClientbound) */
    offClientbound(packetName: string, handler: PacketListenerHandler): void;
    /** Remove a serverbound packet listener */
    offServerbound(packetName: string, handler: PacketListenerHandler): void;
}

/**
 * Players API: opponent and player data, Hypixel stats, UUID resolution.
 */
export interface PluginPlayers {
    /** Get the list of confirmed opponents in the current game */
    getOpponents(): PlayerInfo[];
    /** Get the list of players in the current lobby (usernames, lowercase) */
    getLobbyPlayers(): string[];
    /** Check if a UUID belongs to a confirmed real player (not an NPC) */
    isRealPlayer(uuid: string): boolean;
    /** Get the UUID mapped to an entity ID (from named_entity_spawn) */
    getUuidForEntity(entityId: number): string | undefined;
    /** Fetch a player's Hypixel stats by UUID (uses cache when available). @returns Promise resolving to stats or null */
    fetchStats(uuid: string): Promise<HypixelPlayerStats | null>;
    /** Fetch a player's Hypixel stats by username. @returns Promise resolving to stats or null */
    fetchStatsByUsername(username: string): Promise<HypixelPlayerStats | null>;
    /** Resolve a username to a UUID via Mojang API. @returns Promise resolving to UUID or null */
    resolveUuid(username: string): Promise<string | null>;
    /** Resolve a UUID to a username via Hypixel API (cached). @returns Promise resolving to username or null */
    resolveUsername(uuid: string): Promise<string | null>;
}

/**
 * Session and daily stats API: current session and daily performance data.
 */
export interface PluginSessionStats {
    /** Get current session stats. @returns SessionStats or null if no active session */
    getSessionStats(): SessionStats | null;
    /** Get daily stats. @returns DailyStatsSnapshot or null if service unavailable */
    getDailyStats(): DailyStatsSnapshot | null;
    /** Get stats for a specific game mode from the daily tracker. @returns wins, losses, wlr or null */
    getModeStats(
        mode: string,
    ): { wins: number; losses: number; wlr: number } | null;
    /** Get the game log for the current session */
    getGameLog(): GameLogEntry[];
    /** Check if the current session has any recorded activity */
    hasSessionActivity(): boolean;
    /** Check if daily stats have any recorded activity */
    hasDailyActivity(): boolean;
}

/**
 * Read-only snapshot of the sidebar scoreboard currently shown to the player.
 */
export interface SidebarSnapshot {
    /**
     * Sidebar title as sent by the server, with Minecraft color codes intact.
     * Empty string if no title was sent.
     */
    title: string;
    /**
     * Sidebar lines in top-to-bottom display order, with color codes intact.
     * Empty strings are allowed — they represent blank rows on the sidebar.
     */
    lines: string[];
}

/**
 * Scoreboard API
 * Read-only access to scoreboard team data and the sidebar.
 */
export interface PluginScoreboard {
    /** Get all teams currently tracked */
    getTeams(): TeamInfo[];
    /** Get a specific team by name */
    getTeam(name: string): TeamInfo | undefined;
    /** Get the team a player belongs to */
    getPlayerTeam(username: string): TeamInfo | undefined;
    /**
     * Get a snapshot of the sidebar scoreboard (title + lines, top-to-bottom).
     * Returns `null` if no sidebar is currently displayed. Color codes (`§`-prefixed)
     * are preserved so callers can match on them (e.g. lobby vs. in-game colors).
     */
    getSidebar(): SidebarSnapshot | null;
}

/** Settings change callback */
export type SettingsChangeCallback = (
    key: string,
    oldValue: unknown,
    newValue: unknown,
) => void;

/**
 * Settings API
 * Read and write proxy settings, and listen for changes.
 */
export interface PluginSettings {
    /** Get a setting value by key */
    get(key: string): unknown;
    /** Set a setting value by key (persisted to disk) */
    set(key: string, value: unknown): void;
    /** Get all settings as a snapshot */
    getAll(): Record<string, unknown>;
    /** Subscribe to setting changes */
    onChange(callback: SettingsChangeCallback): void;
    /** Unsubscribe from setting changes */
    offChange(callback: SettingsChangeCallback): void;
}

/**
 * Scheduler API
 * Managed timers that are automatically cleaned up when the plugin unloads.
 * Prevents leaked intervals and timeouts.
 */
export interface PluginScheduler {
    /** Schedule a one-time callback (auto-cleaned on unload) */
    setTimeout(callback: () => void, ms: number): number;
    /** Schedule a repeating callback (auto-cleaned on unload) */
    setInterval(callback: () => void, ms: number): number;
    /** Cancel a scheduled timeout */
    clearTimeout(id: number): void;
    /** Cancel a scheduled interval */
    clearInterval(id: number): void;
    /** Cancel all scheduled timers */
    clearAll(): void;
}

/** Namespaced logger for the plugin */
export interface PluginLogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}

/** Read-only proxy information */
export interface ProxyInfo {
    /** Proxy version string (e.g., "v1.8.0-beta") */
    readonly version: string;
}

/**
 * Current game identity for {@link GameModeExtension.match}.
 * `gametype` / `mode` are Hypixel /locraw values (may be null briefly after server change).
 */
export interface GameModeMatchContext {
    gametype: string | null;
    mode: string | null;
}

/**
 * Mode-specific stats for auto-stats chat + stat tags, produced by a {@link GameModeExtension}.
 */
export interface GameModeStatExtraction {
    wins: number;
    losses: number;
    winstreak: number;
    bestWinstreak: number;
    /** Mapped to stat-tag "Kills" (e.g. Bedwars final kills) */
    tagKills: number;
    /** Mapped to stat-tag "Deaths" (e.g. Bedwars final deaths) */
    tagDeaths: number;
    /** Game-specific level/prestige (e.g. Bedwars stars, Skywars levels). Available to plugin-contributed stat options. */
    level?: number;
}

/**
 * Display + numeric pairing returned by a {@link PluginStatTagOption.extract}.
 * `display` is the text rendered in the tag (e.g. `"1350"`, `"3.7"`); `raw` is used
 * for colour thresholds and sorting.
 */
export interface StatTagValue {
    display: string;
    raw: number;
}

/**
 * Predeclared colour strategies the proxy knows how to render. Plugin-contributed
 * stat options can either pick one of these, or supply a custom `(raw) => "§x"` function.
 *
 * - `wins` — proxy's built-in wins palette
 * - `losses` — proxy's built-in losses palette
 * - `ratio` — WLR/FKDR-style tiered palette
 * - `level` — level/prestige tiered palette (Hypixel Bedwars star-style)
 * - `winstreakCurrent` — current winstreak palette
 * - `winstreakBest` — best winstreak palette
 * - `neutral` — flat grey; no threshold colouring
 */
export type StatTagColorKind =
    | "wins"
    | "losses"
    | "ratio"
    | "level"
    | "winstreakCurrent"
    | "winstreakBest"
    | "neutral";

/**
 * A stat-tag option contributed by a plugin. Registered via {@link GameModeExtension.statTagOptions};
 * shows up as a selectable option in /ds stat-tag prefix/suffix cycles when the user is in a
 * matching game mode.
 */
export interface PluginStatTagOption {
    /** Stable id unique within the extension (e.g. `"fkdr"`, `"bws"`). Used for persistence. */
    id: string;
    /** Label shown in the settings cycle and stat-tag rendering (e.g. `"FKDR"`). */
    display: string;
    /**
     * Produce the display text + raw numeric value from extracted stats.
     * Return null to skip rendering this tag for this player.
     */
    extract(stats: GameModeStatExtraction): StatTagValue | null;
    /**
     * Colouring strategy. Either a known {@link StatTagColorKind} or a custom
     * `(raw) => "§x"` function. Defaults to `"neutral"`.
     */
    color?: StatTagColorKind | ((raw: number) => string);
}

/**
 * Rendering context passed to {@link PluginScoreboardStatOption.render}.
 * Gives the plugin the current session snapshot + active game mode so it can
 * tailor its scoreboard line without reaching into proxy internals.
 */
export interface ScoreboardStatRenderContext {
    session: {
        wins: number;
        losses: number;
        currentWinstreak: number;
        durationMs: number;
    };
    /** Raw Hypixel /locraw mode, or null if unknown */
    currentMode: string | null;
}

/**
 * A scoreboard stat option contributed by a plugin. Registered via
 * {@link GameModeExtension.scoreboardStatOptions}; available in /ds scoreboard
 * settings when the user is in a matching game mode.
 */
export interface PluginScoreboardStatOption {
    /** Stable id unique within the extension. Used for persistence. */
    id: string;
    /** Label shown in settings + rendered on the scoreboard (e.g. `"Beds Broken"`). */
    label: string;
    /** Return the formatted scoreboard line value, or null to omit. */
    render(ctx: ScoreboardStatRenderContext): string | null;
}

/**
 * Register support for a game/mode without changing proxy core.
 * First matching extension wins (registration order). Unregister on plugin unload is automatic.
 */
export interface GameModeExtension {
    /** Stable id unique within your plugin (e.g. `hypixel-bedwars-queues`) */
    id: string;
    /** Return true when this extension should handle the current /locraw game */
    match(ctx: GameModeMatchContext): boolean;
    /**
     * Supply wins/losses/streaks and tag kills/deaths from raw Hypixel `player` API JSON.
     * Return null to fall back to built-in Duels mode stats.
     */
    extractStats?(rawHypixelPlayer: Record<string, unknown>, locrawMode: string): GameModeStatExtraction | null;
    /**
     * Stat-tag colour strategy for prefix/suffix stats.
     * `ratio` — WLR/FKDR-style tiers; omit or `duels` for default Duels+ behaviour.
     */
    statTagColorProfile?: "duels" | "ratio";
    /**
     * Use Hypixel scoreboard team colour for the base nametag (multi-team games).
     * Core already handles Bridge and Hypixel Bedwars; set for new games.
     */
    useScoreboardTeamColors?: boolean;
    /** Show coloured level/star block in solo auto-stats lines (needs `level` on extracted stats) */
    showLevelInAutoStats?: boolean;
    /**
     * Game-specific stat-tag options to expose in /ds prefix/suffix cycles
     * while the user is in a matching mode (e.g. Bedwars' FKDR/BWS/Stars).
     */
    statTagOptions?: PluginStatTagOption[];
    /**
     * Game-specific scoreboard stat options to expose in /ds scoreboard settings
     * while the user is in a matching mode.
     */
    scoreboardStatOptions?: PluginScoreboardStatOption[];
    /**
     * When true, the proxy treats this extension as authoritative for the
     * scoreboard title while its `match()` holds — useful for games whose
     * Hypixel scoreboard header differs from the proxy-assumed "DUELS" title.
     */
    replaceScoreboardTitle?: boolean;
}

/**
 * API surface on {@link PluginContext} to register game mode behaviour.
 */
export interface PluginGameModes {
    register(extension: GameModeExtension): void;
    unregister(extensionId: string): void;
}

// ─── Chest GUI API ───

/** Click handler callback for GUI slots */
export type GUIClickHandler = (slot: number, button: 'left' | 'right') => void | Promise<void>;

/** Number of rows for a chest GUI (1-6) */
export type GUIRows = 1 | 2 | 3 | 4 | 5 | 6;

/** Item data for GUI slots */
export interface GUIItemData {
    blockId: number;
    itemCount?: number;
    itemDamage?: number;
    nbtData?: unknown;
}

/** Chest GUI instance for creating interactive inventory windows */
export interface PluginChestGUI {
    /** The unique window ID for this GUI */
    readonly windowId: number;
    /** Number of rows */
    readonly rows: GUIRows;
    /** Total slot count (rows * 9) */
    readonly slotCount: number;
    /** Whether the GUI is currently open */
    readonly isOpen: boolean;
    /** Set an item in a specific slot with optional click handler */
    setItem(slot: number, item: GUIItemData, onClick?: GUIClickHandler): this;
    /** Remove an item from a slot */
    removeItem(slot: number): this;
    /** Clear all items */
    clear(): this;
    /** Fill empty slots with an item (e.g. glass panes) */
    fill(item: GUIItemData): this;
    /** Fill empty slots with black stained glass panes */
    fillBlack(): this;
    /** Fill empty slots with gray stained glass panes */
    fillGray(): this;
    /** Create a border around the GUI */
    border(item: GUIItemData): this;
    /** Set a row of items */
    setRow(row: number, items: (GUIItemData | null)[], startCol?: number): this;
    /** Center an item in a row (column 4) */
    centerItem(row: number, item: GUIItemData, onClick?: GUIClickHandler): this;
    /** Open the GUI to the player. Returns true on success. */
    open(): boolean;
    /** Close the GUI */
    close(): void;
    /** Refresh the GUI contents (re-send items) */
    refresh(): boolean;
    /** Update a single slot without full refresh */
    updateSlot(slot: number, item: GUIItemData, onClick?: GUIClickHandler): boolean;
}

/** GUI API: create interactive chest inventory windows */
export interface PluginGUI {
    /** Create a new chest GUI with title and optional row count (1-6, default 3) */
    createChestGUI(title: string, rows?: GUIRows): PluginChestGUI;
    /** Create a glass pane item (for fillers/borders) */
    createGlassPane(color: number, name?: string): GUIItemData;
    /** Create an item with optional name and lore */
    createItem(blockId: number, damage?: number, name?: string, lore?: string[]): GUIItemData;
}

/**
 * The full plugin context - your gateway to the proxy.
 * Received in `onLoad()`. Store it (e.g. `this.ctx = ctx`) to use across your plugin's lifecycle.
 *
 * @example
 * ```ts
 * onLoad(ctx: PluginContext) {
 *   this.ctx = ctx;
 *   ctx.events.on('game:start', (p) => ctx.client.sendChat(`§a${p.mode} started!`));
 *   ctx.commands.register({ name: 'hello', description: 'Say hi', execute: () => ctx.client.sendChat('Hi!') });
 * }
 * ```
 */
export interface PluginContext {
    /** Subscribe to proxy events (game:start, opponent:detected, etc.) */
    readonly events: PluginEvents;
    /** Send chat, titles, sounds, and packets to the player's client or to the server */
    readonly client: PluginClient;
    /** Game state: locraw, mode, map, isInGame(), isInLobby(), getSetting(), getCache() */
    readonly gameState: PluginGameState;
    /** Register/unregister chat commands (e.g. /mycommand) */
    readonly commands: PluginCommands;
    /** Persistent key-value storage (persisted to disk per plugin) */
    readonly storage: PluginStorage;
    /** Read-only packet observation (clientbound/serverbound) */
    readonly packets: PluginPackets;
    /** Namespaced logger (info, warn, error, debug) */
    readonly logger: PluginLogger;
    /** Proxy version and metadata */
    readonly proxy: ProxyInfo;
    /** Player and opponent data, Hypixel stats, UUID resolution */
    readonly players: PluginPlayers;
    /** Session and daily stats, game log */
    readonly stats: PluginSessionStats;
    /** Scoreboard team data (getTeams, getPlayerTeam) */
    readonly scoreboard: PluginScoreboard;
    /** Read/write proxy settings, onChange subscription */
    readonly settings: PluginSettings;
    /** Managed timers (setTimeout/setInterval, auto-cleanup on unload) */
    readonly scheduler: PluginScheduler;
    /**
     * Register custom /locraw modes: stat extraction for auto-stats + stat tags, colours, team nametags.
     */
    readonly gameModes: PluginGameModes;
    /** Create interactive chest GUI windows */
    readonly gui: PluginGUI;
}

/**
 * Plugin metadata (matches the "duelsplus" field in package.json).
 */
export interface PluginMetadata {
    /** Unique plugin identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description of what the plugin does */
    description?: string;
    /** Plugin version (semver) */
    version?: string;
    /** Plugin author */
    author?: string;
    /** Minimum plugin API version required; semver range (e.g. ">=1.0.0") so the proxy can reject incompatible plugins */
    apiVersion?: string;
}
