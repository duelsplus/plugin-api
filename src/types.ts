/**
 * Plugin API Type Definitions
 * All types, interfaces, and contracts for the Duels+ Plugin System
 * @module @duelsplus/plugin-api/types
 */

// ==========================================
// Game State Types
// ==========================================

/** Hypixel /locraw response data */
export interface LocrawData {
  /** Server identifier (e.g., "mini123A") */
  server: string;
  /** Game type (e.g., "DUELS", "BEDWARS") */
  gametype?: string;
  /** Lobby name — only set when in a lobby */
  lobbyname?: string;
  /** Game mode (e.g., "DUELS_UHC_DUEL") */
  mode?: string;
  /** Map name — only set when in a game */
  map?: string;
}

/** Game result type */
export type GameResult = 'victory' | 'defeat' | 'draw' | 'unknown';

// ==========================================
// Plugin Event Types
// ==========================================

/** All event names available to plugins */
export type PluginEventName =
  | 'proxy:ready'
  | 'client:connected'
  | 'client:disconnected'
  | 'game:start'
  | 'game:end'
  | 'game:victory'
  | 'game:defeat'
  | 'lobby:join'
  | 'lobby:leave'
  | 'locraw:update'
  | 'server:change';

/** Base event payload — all events include a timestamp */
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

/** Payload for game:start */
export interface GameStartPayload extends BaseEventPayload {
  mode: string;
  map?: string;
  gametype: string;
  server: string;
}

/** Payload for game:end, game:victory, game:defeat */
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

/** Map of event names to their payload types */
export interface PluginEventPayloadMap {
  'proxy:ready': BaseEventPayload;
  'client:connected': ClientConnectedPayload;
  'client:disconnected': ClientDisconnectedPayload;
  'game:start': GameStartPayload;
  'game:end': GameEndPayload;
  'game:victory': GameEndPayload;
  'game:defeat': GameEndPayload;
  'lobby:join': LobbyJoinPayload;
  'lobby:leave': BaseEventPayload;
  'locraw:update': LocrawUpdatePayload;
  'server:change': LocrawUpdatePayload;
}

/** Type-safe event handler */
export type PluginEventHandler<E extends PluginEventName> = (
  payload: PluginEventPayloadMap[E]
) => void | Promise<void>;

// ==========================================
// Plugin API Interfaces
// ==========================================

/**
 * Event subscription API
 * Subscribe to proxy lifecycle, game, and connection events.
 */
export interface PluginEvents {
  /** Subscribe to an event */
  on<E extends PluginEventName>(event: E, handler: PluginEventHandler<E>): void;
  /** Subscribe to an event (fires once then auto-removes) */
  once<E extends PluginEventName>(event: E, handler: PluginEventHandler<E>): void;
  /** Unsubscribe from an event */
  off<E extends PluginEventName>(event: E, handler: PluginEventHandler<E>): void;
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
  /** Send a title and optional subtitle to the player */
  sendTitle(title: string, subtitle?: string, options?: TitleOptions): void;
  /** Send an action bar message to the player */
  sendActionBar(message: string): void;
  /** Play a sound to the player */
  playSound(name: string, volume?: number, pitch?: number): void;
  /** Send any arbitrary packet to the player's client (advanced) */
  sendPacket(name: string, data: unknown): void;
}

/**
 * Read-only game state access
 * Query the current server, game mode, lobby, and player settings.
 */
export interface PluginGameState {
  /** Current /locraw data (server, mode, map, etc.) */
  readonly locraw: Readonly<LocrawData>;
  /** Whether a player is currently connected */
  readonly isConnected: boolean;

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

  /** Read a user setting value (e.g., "autoStats", "pearlTimer") */
  getSetting(key: string): unknown;
  /** Read a value from the runtime cache */
  getCache(key: string): unknown;
}

/** Plugin command definition */
export interface PluginCommandDefinition {
  /** Command name (e.g., "myplugin" for /myplugin) */
  name: string;
  /** Description shown in help */
  description: string;
  /** Usage syntax shown in help (e.g., "/myplugin <action> [args]") */
  usage?: string;
  /** Alternative names for this command */
  aliases?: string[];
  /** Execute the command */
  execute: (args: string[], sender: { username: string; uuid: string }) => void | Promise<void>;
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
 * Persistent per-plugin key-value storage
 * Data is stored in ~/.duelsplus/plugins/<plugin-id>/storage.json
 * and persists across proxy restarts.
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
 * Read-only packet listening API
 * Observe packets flowing between the client and server.
 * Listeners are read-only — you cannot modify or cancel packets.
 *
 * NOTE: Fast-path packets (movement, combat, chunks, etc.) are NOT observable
 * for performance reasons. Only processed packets are visible.
 */
export interface PluginPackets {
  /** Listen to a packet coming from the server (Hypixel → player) */
  onClientbound(packetName: string, handler: PacketListenerHandler): void;
  /** Listen to a packet coming from the client (player → Hypixel) */
  onServerbound(packetName: string, handler: PacketListenerHandler): void;
  /** Remove a clientbound packet listener */
  offClientbound(packetName: string, handler: PacketListenerHandler): void;
  /** Remove a serverbound packet listener */
  offServerbound(packetName: string, handler: PacketListenerHandler): void;
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
 * The full plugin context — your gateway to the proxy.
 * Received in `onLoad()`. Store it to use across your plugin's lifecycle.
 */
export interface PluginContext {
  /** Subscribe to proxy events */
  readonly events: PluginEvents;
  /** Send packets/messages to the player's client */
  readonly client: PluginClient;
  /** Read-only game state (location, settings, etc.) */
  readonly gameState: PluginGameState;
  /** Register/unregister chat commands */
  readonly commands: PluginCommands;
  /** Persistent key-value storage */
  readonly storage: PluginStorage;
  /** Read-only packet observation */
  readonly packets: PluginPackets;
  /** Namespaced logger */
  readonly logger: PluginLogger;
  /** Proxy version and metadata */
  readonly proxy: ProxyInfo;
}

/** Plugin metadata (matches the "duelsplus" field in package.json) */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what the plugin does */
  description?: string;
  /** Plugin version */
  version?: string;
  /** Plugin author */
  author?: string;
  /** Minimum plugin API version required (semver range) */
  apiVersion?: string;
}
