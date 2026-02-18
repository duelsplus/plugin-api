# @duelsplus/plugin-api

Official Plugin API for the Duels+ Proxy. Use this package to build plugins that run inside the proxy;

## Installation

```bash
npm install @duelsplus/plugin-api
# or
bun add @duelsplus/plugin-api
```

## Quick start

```ts
import { Plugin, PluginContext } from '@duelsplus/plugin-api';

export default class MyPlugin extends Plugin {
  id = 'my-plugin';
  name = 'My Plugin';

  onLoad(ctx: PluginContext) {
    ctx.events.on('game:start', () => {
      ctx.client.sendChat('§aGame started!');
    });
  }
}
```

Plugins live in `~/.duelsplus/plugins/<your-plugin>/`. The proxy loads them at startup and provides the runtime; you use this package for types and the `Plugin` base class.

## Examples

See the [examples](examples/) directory for full plugins: auto-glhf, match-alerts, opponent-tracker, session-overlay, game-logger, lobby-spy.

## License
idrk
