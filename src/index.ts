/**
 * @duelsplus/plugin-api
 *
 * Official Plugin API for the Duels+ Proxy.
 * Import types and the Plugin base class from this package to build plugins.
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
} from './types';
