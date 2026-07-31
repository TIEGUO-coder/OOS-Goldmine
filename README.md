# OSS Goldmine

> Find open-source projects where demand is still alive but maintenance is fading, then turn the evidence into AI-ready opportunity cards.

![OSS Goldmine preview](./docs/assets/oss-goldmine-preview.svg)

OSS Goldmine is not another abandoned-repo list.

It answers the question builders actually care about:

**What small product can I build from this demand signal without cloning the original project?**

## Demo

Live demo:

```text
https://tieguo-coder.github.io/OOS-Goldmine/
```

If the demo is 404 after the first push, enable GitHub Pages in `Settings -> Pages -> Deploy from a branch -> gh-pages / root`.

Repository setup checklist: [docs/GITHUB_SETUP.md](./docs/GITHUB_SETUP.md)

## Try These Topics

After running locally, try:

- `API testing tools`
- `React performance tools`
- `database migration tools`
- `browser developer extensions`
- `OpenAPI security`

The app includes sample opportunity cards, so the first screen is useful before any live search.

## What It Generates

Each opportunity card includes:

- Demand Gap Score
- Maintenance gap
- Repeated issue themes
- Build / Adapt / Watch verdict
- Smallest useful wedge
- Evidence links
- AI Build Plan

## Real GitHub Evidence

The current version performs live GitHub evidence checks:

- Fetch repository metadata
- Fetch top open issues
- Fetch recently closed issues
- Fetch open pull requests
- Fetch recent commits from the last 90 days
- Fetch recent releases
- Cluster demand-like issue themes
- Flag stale issues and stale PRs
- Penalize likely obsolete projects

If GitHub rate limits are hit, cards are marked `Evidence limited` and downgraded to `Watch` unless demand evidence is strong enough.

## Why It May Get Stars

Open-source builders like tools that help them find better starting points.

Most discovery tools stop at:

> This repository is old.

OSS Goldmine goes one step further:

> Demand is still alive, maintenance is fading, and this is the smallest useful wedge to build next.

## How It Works

1. Search GitHub by topic.
2. Pull repository, issue, PR, commit, and release signals.
3. Score the demand gap.
4. Classify the opportunity.
5. Generate an AI-ready build brief.

## Demand Gap Score

The score is intentionally simple and transparent:

```text
score =
  stars signal
+ open issue signal
+ quiet-month signal
+ fork signal
+ demand issue signal
+ stale issue signal
- active maintainer penalty
- evidence penalty
- archived penalty
- obsolete penalty
```

Signal meanings:

| Signal | Meaning |
| --- | --- |
| Stars | Historical demand and attention |
| Open issues | Unresolved demand |
| Quiet months | Maintenance gap |
| Forks | Revival or adaptation interest |
| Demand-like issues | Repeated requests for support, migration, integration, export, CLI, API, etc. |
| Recent commits | Active maintenance reduces the gap |
| Stale PRs | Contributor demand may exist but review capacity may be low |
| Penalties | Archived repos, weak issue evidence, or likely-obsolete categories |

This is not an investment verdict. It is a fast filter for builders.

## Run Locally

Install dependencies:

```bash
npm install
```

Run the API:

```bash
npm run api
```

Run the web app:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Optional server token:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
GITHUB_TOKEN=your_read_only_github_token
PORT=8787
VITE_API_BASE_URL=
```

`.env` is ignored by git and should never be committed.

For a deployed frontend, set `VITE_API_BASE_URL` to the public API origin, for example:

```bash
VITE_API_BASE_URL=https://oss-goldmine-api.onrender.com
```

API endpoint:

```text
GET /api/opportunities?topic=API%20testing%20tools&page=1
```

## Deploy the API

GitHub Pages can host the static app, but it cannot run the Node API. For reliable public search, deploy the API separately.

This repo includes `render.yaml` for Render:

1. Create a new Render Blueprint from this repository.
2. Set `GITHUB_TOKEN` as a secret environment variable.
3. Deploy the `oss-goldmine-api` web service.
4. Confirm `https://your-api-host/health` returns `{"ok":true}`.
5. Add a GitHub repository variable named `VITE_API_BASE_URL` with the API origin.
6. Re-run the GitHub Pages workflow.

Without `VITE_API_BASE_URL`, the app tries `/api/opportunities` on the current origin and then falls back to direct browser GitHub requests.

## GitHub Token

A GitHub token is optional.

Without a token, the app still works, but anonymous GitHub API limits are easy to hit. A read-only token makes search more stable.

Never paste a personal token into public screenshots, issues, or pull requests.

## V1 Scope

- GitHub only
- No login
- No database
- Optional read-only token
- Web demo first
- Respect maintainers

## Non-goals

- Not a repo-shaming tool
- Not a clone generator
- Not a replacement for maintainers
- Not a generic idea list

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

You can open an issue to suggest an opportunity card or report a false positive.

## Launch Copy

See [LAUNCH.md](./LAUNCH.md).

## License

MIT
