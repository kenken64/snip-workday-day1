# Snip

Snip is one URL-shortening backend with two clients: an Angular web interface and a zero-dependency Node.js CLI. Each layer lives on its own branch of this repository, while `main` collects those branches as submodules so the complete system can be checked out together.

## API contract

The backend listens on `http://localhost:3000` by default and stores links in memory.

| Method | Path | Request | Success response | Errors |
| --- | --- | --- | --- | --- |
| `POST` | `/api/links` | JSON `{ "url": "https://example.com" }` | `201` link object with `code`, `url`, `shortUrl`, `hits`, and `createdAt` | `400` with `{ "error": "..." }` |
| `GET` | `/api/links` | None | `200` array of link objects | `404` with `{ "error": "Not found" }` |
| `GET` | `/:code` | None | `302` redirect to the original URL and increment `hits` | `404` with `{ "error": "Not found" }` |

## Repository layout

| Path | Tracking branch | Purpose |
| --- | --- | --- |
| `backend/` | `backend` | Bun HTTP API and redirects |
| `frontend/` | `frontend` | Angular web client |
| `cli/` | `cli` | CommonJS Node.js command-line client |
| `bundle/` | `bundle` | Generated deployable backend, web client, and CLI |

The entries are Git submodules, not copied source directories. Clone recursively so their contents are populated:

```sh
git clone --recurse-submodules https://github.com/kenken64/snip-workday-day1.git
cd snip-workday-day1
```

A plain `git clone` leaves the submodule folders empty. If the repository was already cloned without recursion, initialize it with:

```sh
git submodule update --init --recursive
```

## Run

Start the backend first. It requires Bun:

```sh
cd backend
bun install
bun start
```

In another terminal, install and start the Angular client at `http://localhost:4200`:

```sh
cd frontend
npm install
npm start
```

The CLI requires Node.js 18 or newer and has no dependencies:

```sh
cd cli
./snip add https://example.com
./snip ls
./snip open <code>
```

The CLI uses `http://localhost:3000` by default. Set `SNIP_API` to target another backend.

## Build the release bundle

The `bundle/` submodule is generated output and must not be edited by hand. Build it from the source branch tips with Node.js 18 or newer:

```sh
node scripts/build-bundle.mjs
```

The builder updates the source submodules, installs and builds the Angular client, assembles the Bun release, and commits changed bundle and superproject pointers. Add `--push` to push the generated `bundle` branch and `main` after a successful build:

```sh
node scripts/build-bundle.mjs --push
```

## Update a layer

Make, commit, and push changes from inside the relevant submodule folder. Then update and commit the submodule pointer in the superproject:

```sh
cd backend                       # or frontend / cli
git add .
git commit -m "Describe the layer change"
git push

cd ..
git submodule update --remote backend
git add backend
git commit -m "Update backend submodule"
git push
```

Replace `backend` with the submodule path being updated. The first commit belongs to that layer's branch; the second records its new commit pointer on `main`.