# Snip CLI

A zero-dependency Node.js client for the Snip backend. Node.js 18 or newer is required.

## Usage

```text
snip add <url>    Shorten a URL and print the short URL
snip ls           List each code, hit count, and destination URL
snip open <code>  Resolve a code and open its destination in the OS browser
snip help         Show usage information
```

The backend defaults to `http://localhost:3000`. Set `SNIP_API` to use another server:

```sh
SNIP_API=https://snip.example.com ./snip ls
```

Run `npm link` to install the `snip` command, or invoke the wrapper for your shell: `./snip`, `snip.cmd`, or `snip.ps1`.