#!/usr/bin/env node

'use strict';

const { spawnSync } = require('node:child_process');

const DEFAULT_API_URL = 'http://localhost:3000';
const USAGE = `Usage:
  snip add <url>    Shorten a URL
  snip ls           List shortened links
  snip open <code>  Open a shortened link in your browser
  snip help         Show this help`;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

function getBaseUrl() {
  const value = (process.env.SNIP_API || DEFAULT_API_URL).replace(/\/+$/, '');

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }
  } catch {
    throw new Error('SNIP_API must be a valid HTTP or HTTPS URL.');
  }

  return value;
}

async function request(baseUrl, path, options) {
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, options);
  } catch {
    throw new Error(`Could not reach the Snip backend at ${baseUrl}.`);
  }

  if (!response.ok) {
    let message;

    try {
      const body = await response.json();
      message = body.error || body.message;
    } catch {
      // The status text below is enough when the backend does not return JSON.
    }

    throw new Error(message || `Request failed (${response.status} ${response.statusText}).`);
  }

  return response;
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }
    return url.href;
  } catch {
    throw new Error('URL must be a valid HTTP or HTTPS URL.');
  }
}

async function addLink(baseUrl, args) {
  if (args.length !== 1) {
    throw new Error('Usage: snip add <url>');
  }

  const url = validateUrl(args[0]);
  const response = await request(baseUrl, '/api/links', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url })
  });
  const link = await response.json();

  if (!link.shortUrl) {
    throw new Error('The backend returned an invalid link.');
  }

  console.log(link.shortUrl);
}

function printLinks(links) {
  if (links.length === 0) {
    console.log('No links yet.');
    return;
  }

  const rows = [
    ['CODE', 'HITS', 'URL'],
    ...links.map((link) => [String(link.code), String(link.hits), String(link.url)])
  ];
  const codeWidth = Math.max(...rows.map((row) => row[0].length));
  const hitsWidth = Math.max(...rows.map((row) => row[1].length));

  for (const [code, hits, url] of rows) {
    console.log(`${code.padEnd(codeWidth)}  ${hits.padStart(hitsWidth)}  ${url}`);
  }
}

async function listLinks(baseUrl, args) {
  if (args.length !== 0) {
    throw new Error('Usage: snip ls');
  }

  const response = await request(baseUrl, '/api/links');
  const links = await response.json();

  if (!Array.isArray(links)) {
    throw new Error('The backend returned an invalid links list.');
  }

  printLinks(links);
}

function openBrowser(target) {
  let command;
  let args;

  if (process.platform === 'win32') {
    command = 'cmd.exe';
    args = ['/d', '/s', '/c', 'start', '""', target];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [target];
  } else {
    command = 'xdg-open';
    args = [target];
  }

  const result = spawnSync(command, args, { stdio: 'ignore' });
  if (result.error || result.status !== 0) {
    throw new Error(`Could not open ${target} in the OS browser.`);
  }
}

async function openLink(baseUrl, args) {
  if (args.length !== 1 || !args[0]) {
    throw new Error('Usage: snip open <code>');
  }

  const code = encodeURIComponent(args[0]);
  let response;

  try {
    response = await fetch(`${baseUrl}/${code}`, { redirect: 'manual' });
  } catch {
    throw new Error(`Could not reach the Snip backend at ${baseUrl}.`);
  }

  if (response.status < 300 || response.status >= 400) {
    if (response.status === 404) {
      throw new Error(`Unknown code: ${args[0]}`);
    }
    throw new Error(`Request failed (${response.status} ${response.statusText}).`);
  }

  const location = response.headers.get('location');
  if (!location) {
    throw new Error('The backend redirect did not include a Location target.');
  }

  openBrowser(new URL(location, `${baseUrl}/`).href);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(USAGE);
    return;
  }

  const baseUrl = getBaseUrl();

  if (command === 'add') {
    await addLink(baseUrl, args);
  } else if (command === 'ls') {
    await listLinks(baseUrl, args);
  } else if (command === 'open') {
    await openLink(baseUrl, args);
  } else {
    throw new Error(`Unknown command: ${command}\n\n${USAGE}`);
  }
}

main().catch((error) => fail(error.message));