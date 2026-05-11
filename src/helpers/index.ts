// Building blocks for plugins that follow the standard Hypixel-game shape:
// detect phase off the sidebar, harvest the lobby roster with /who, run
// in-game stat trackers, and persist a session across games.
//
// These helpers are unopinionated about the game itself — Bedwars uses them
// today; Skywars/Duels/Murder Mystery plugins can build on top with their
// own sidebar parser, stat shape, and chat patterns.

export { WhoTracker } from './WhoTracker';
export type { WhoTrackerOptions } from './WhoTracker';

export { EarlyChatBuffer } from './EarlyChatBuffer';
export type { EarlyChatBufferOptions } from './EarlyChatBuffer';

export { SessionTracker } from './SessionTracker';
export type { SessionTrackerOptions } from './SessionTracker';

export { GamePhaseDriver } from './GamePhaseDriver';
export type { GamePhaseDriverOptions, PhaseListener, PollListener } from './GamePhaseDriver';

export { ScopedLogger, createLogger } from './ScopedLogger';
