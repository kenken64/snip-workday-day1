#!/usr/bin/env node

import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = join(rootDir, 'backend');
const frontendDir = join(rootDir, 'frontend');
const cliDir = join(rootDir, 'cli');
const bundleDir = join(rootDir, 'bundle');
const frontendOutputDir = join(frontendDir, 'dist', 'snip-frontend', 'browser');
const shouldPush = process.argv.slice(2).includes('--push');
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--push');

if (unknownArgs.length > 0) {
  console.error(`Unknown argument: ${unknownArgs[0]}`);
  process.exit(1);
}

function commandName(name) {
  return process.platform === 'win32' && name === 'npm' ? 'npm.cmd' : name;
}

function run(command, args, cwd = rootDir, stdio = 'inherit') {
  const result = spawnSync(commandName(command), args, { cwd, stdio });

  if (result.error) {
    throw new Error(`Could not run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }

  return result;
}

function hasStagedChanges(cwd, paths) {
  const result = spawnSync(commandName('git'), ['diff', '--cached', '--quiet', '--', ...paths], {
    cwd,
    stdio: 'ignore'
  });

  if (result.status === 0) {
    return false;
  }

  if (result.status === 1) {
    return true;
  }

  throw new Error(`Could not inspect staged changes in ${cwd}.`);
}

function write(path, content) {
  writeFileSync(join(bundleDir, path), `${content.trimEnd()}\n`, 'utf8');
}

function assembleBundle() {
  for (const entry of readdirSync(bundleDir)) {
    if (entry !== '.git' && entry !== 'README.md') {
      rmSync(join(bundleDir, entry), { recursive: true, force: true });
    }
  }

  copyFileSync(join(backendDir, 'server.js'), join(bundleDir, 'server.js'));
  copyFileSync(join(cliDir, 'cli.js'), join(bundleDir, 'cli.js'));
  cpSync(frontendOutputDir, join(bundleDir, 'public'), { recursive: true });

  write('.env', 'PUBLIC_DIR=./public');
  write('package.json', JSON.stringify({
    name: 'snip-bundle',
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'bun server.js'
    }
  }, null, 2));
  write('Dockerfile', `FROM oven/bun:1-alpine

WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD bun server.js`);
  write('.dockerignore', `.git
node_modules
npm-debug.log*`);
  write('railway.json', JSON.stringify({
    $schema: 'https://railway.com/railway.schema.json',
    build: {
      builder: 'DOCKERFILE',
      dockerfilePath: 'Dockerfile'
    }
  }, null, 2));
}

function commitIfChanged(cwd, paths, message, label) {
  run('git', ['add', '-A', '--', ...paths], cwd);

  if (!hasStagedChanges(cwd, paths)) {
    console.log(`${label}: nothing to commit`);
    return false;
  }

  run('git', ['commit', '-m', message, '--', ...paths], cwd);
  return true;
}

try {
  run('git', ['submodule', 'update', '--init', '--remote', 'backend', 'frontend', 'cli']);

  run('npm', ['install'], frontendDir);
  run('npm', ['run', 'build'], frontendDir);

  const frontendIndex = join(frontendOutputDir, 'index.html');
  if (!existsSync(frontendIndex)) {
    throw new Error(`Frontend build is incomplete: missing ${frontendIndex}`);
  }

  mkdirSync(bundleDir, { recursive: true });
  assembleBundle();
  commitIfChanged(bundleDir, ['.'], 'Build generated bundle', 'bundle');
  commitIfChanged(rootDir, ['backend', 'frontend', 'cli', 'bundle'], 'Update bundle submodule pointers', 'main');

  if (shouldPush) {
    run('git', ['push', 'origin', 'HEAD:bundle'], bundleDir);
    run('git', ['push', 'origin', 'HEAD:main'], rootDir);
  }
} catch (error) {
  console.error(`Bundle build failed: ${error.message}`);
  process.exit(1);
}