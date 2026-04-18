#!/usr/bin/env node

/**
 * Duels+ Plugin Build CLI
 *
 * Bundles a plugin and all its dependencies into a single JS file using esbuild.
 * The @duelsplus/plugin-api package is marked as external since the proxy
 * provides it at runtime.
 *
 * Usage:
 *   npx @duelsplus/plugin-api build          # build from current directory
 *   npx @duelsplus/plugin-api build ./path   # build from a specific directory
 */

import { build, type BuildOptions } from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

interface PluginPackageJson {
  name?: string;
  main?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const EXTERNAL_PACKAGES = ['@duelsplus/plugin-api'];

function printUsage(): void {
  console.log(`
  \x1b[36mDuels+ Plugin Builder\x1b[0m

  Bundles your plugin into a single file for distribution.
  No node_modules needed for end users.

  \x1b[33mUsage:\x1b[0m
    npx @duelsplus/plugin-api build [path]

  \x1b[33mArguments:\x1b[0m
    path    Plugin directory (defaults to current directory)

  \x1b[33mOptions:\x1b[0m
    --minify    Minify the output (default: false)
    --watch     Watch for changes and rebuild
    --help      Show this help message

  \x1b[33mExample:\x1b[0m
    cd my-plugin && npx @duelsplus/plugin-api build
    npx @duelsplus/plugin-api build ./my-plugin --minify
`);
}

function error(msg: string): never {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
}

function info(msg: string): void {
  console.log(`\x1b[36mℹ\x1b[0m ${msg}`);
}

function success(msg: string): void {
  console.log(`\x1b[32m✔\x1b[0m ${msg}`);
}

async function buildPlugin(pluginDir: string, options: { minify: boolean; watch: boolean }): Promise<void> {
  const pkgPath = path.join(pluginDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    error(`No package.json found in ${pluginDir}`);
  }

  let pkg: PluginPackageJson;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    error(`Failed to parse package.json in ${pluginDir}`);
  }

  // Resolve entry point
  const mainField = pkg.main ?? 'index.js';
  let entryPoint: string | undefined;

  // Try the main field as-is, then common TypeScript alternatives
  const candidates = [
    mainField,
    mainField.replace(/\.js$/, '.ts'),
    'src/index.ts',
    'src/index.js',
    'index.ts',
    'index.js',
  ];

  for (const candidate of candidates) {
    const full = path.join(pluginDir, candidate);
    if (fs.existsSync(full)) {
      entryPoint = full;
      break;
    }
  }

  if (!entryPoint) {
    error(`Could not find entry point. Tried: ${candidates.join(', ')}`);
  }

  const outDir = path.join(pluginDir, 'dist');
  const outFile = path.join(outDir, 'index.js');

  info(`Plugin:  ${pkg.name ?? path.basename(pluginDir)}`);
  info(`Entry:   ${path.relative(pluginDir, entryPoint)}`);
  info(`Output:  ${path.relative(pluginDir, outFile)}`);
  if (options.minify) info(`Minify:  enabled`);

  const buildOptions: BuildOptions = {
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: outFile,
    external: EXTERNAL_PACKAGES,
    minify: options.minify,
    sourcemap: false,
    logLevel: 'warning',
    // Tree-shake unused code
    treeShaking: true,
  };

  if (options.watch) {
    const ctx = await (await import('esbuild')).context(buildOptions);
    await ctx.watch();
    success(`Watching for changes...`);
  } else {
    const result = await build(buildOptions);

    if (result.errors.length > 0) {
      error(`Build failed with ${result.errors.length} error(s)`);
    }

    // Report output size
    const stat = fs.statSync(outFile);
    const sizeKB = (stat.size / 1024).toFixed(1);
    success(`Built successfully! (${sizeKB} KB)`);

    // Update package.json main field to point to dist/index.js if it doesn't already
    if (pkg.main !== 'dist/index.js') {
      info(`Tip: set "main": "dist/index.js" in your package.json for the proxy to load the bundled file.`);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  if (command !== 'build') {
    error(`Unknown command: ${command}. Use "build" to bundle your plugin.`);
  }

  // Parse flags and positional args
  const flags = args.slice(1);
  const minify = flags.includes('--minify');
  const watch = flags.includes('--watch');
  const positional = flags.filter(f => !f.startsWith('--'));
  const pluginDir = path.resolve(positional[0] ?? '.');

  if (!fs.existsSync(pluginDir)) {
    error(`Directory not found: ${pluginDir}`);
  }

  try {
    await buildPlugin(pluginDir, { minify, watch });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error(`Build failed: ${msg}`);
  }
}

main();
