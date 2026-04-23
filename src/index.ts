/**
 * @packageDocumentation
 *
 * Official Plugin API for the Duels+ Proxy. This package provides types and the
 * {@link Plugin} base class for building plugins that run inside the proxy.
 * Your plugin receives a {@link PluginContext} in `onLoad()` with access to
 * events, client, game state, commands, storage, and more.
 *
 * @example
 * ```typescript
 * import { Plugin, PluginContext } from '@duelsplus/plugin-api';
 *
 * export default class MyPlugin extends Plugin {
 *   id = 'my-plugin';
 *   name = 'My Plugin';
 *
 *   onLoad(ctx: PluginContext) {
 *     ctx.events.on('game:start', () => {
 *       ctx.client.sendChat('§aGame started!');
 *     });
 *   }
 * }
 * ```
 *
 * @see {@link Plugin} - Base class to extend
 * @see {@link PluginContext} - Context passed to onLoad()
 * @module @duelsplus/plugin-api
 */

// Plugin base class
export { Plugin } from './Plugin';
export type { PluginState } from './Plugin';

// All types and interfaces
export type {
  // Game state
  LocrawData,
  GameResult,
  GamePhase,

  // Player & stats data types
  PlayerInfo,
  HypixelPlayerStats,
  SessionStats,
  DailyStatsSnapshot,
  GameLogEntry,
  TeamInfo,

  // Events
  PluginEventName,
  BaseEventPayload,
  ClientConnectedPayload,
  ClientDisconnectedPayload,
  GameStartPayload,
  GameEndPayload,
  GameJoinPayload,
  GameLeavePayload,
  LobbyJoinPayload,
  LocrawUpdatePayload,
  OpponentDetectedPayload,
  OpponentStatsPayload,
  ModeChangePayload,
  PluginEventPayloadMap,
  PluginEventHandler,

  // Context and API interfaces
  PluginContext,
  PluginEvents,
  PluginClient,
  PluginGameState,
  PluginCommands,
  PluginStorage,
  PluginPackets,
  PluginPlayers,
  PluginSessionStats,
  PluginScoreboard,
  SidebarSnapshot,
  PluginTabList,
  TabListDecoration,
  PluginSettings,
  PluginScheduler,
  PluginLogger,
  ProxyInfo,

  // Settings
  SettingsChangeCallback,

  // Commands
  PluginCommandDefinition,

  // Packets
  PacketMeta,
  PacketListenerHandler,

  // Display
  TitleOptions,

  // Metadata
  PluginMetadata,

  // Pluggable game modes (no proxy fork)
  GameModeMatchContext,
  GameModeStatExtraction,
  GameModeExtension,
  PluginGameModes,
  StatTagValue,
  StatTagColorKind,
  PluginStatTagOption,
  ScoreboardStatRenderContext,
  PluginScoreboardStatOption,

  // GUI
  GUIClickHandler,
  GUIRows,
  GUIItemData,
  PluginChestGUI,
  PluginGUI,
} from './types';
