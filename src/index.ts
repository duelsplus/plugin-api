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

  // Events
  PluginEventName,
  BaseEventPayload,
  ClientConnectedPayload,
  ClientDisconnectedPayload,
  GameStartPayload,
  GameEndPayload,
  LobbyJoinPayload,
  LocrawUpdatePayload,
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
  PluginLogger,
  ProxyInfo,

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
