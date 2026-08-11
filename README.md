# OSS Goldmine

> Daily opportunity radar for builders and their AI agents.

Review AI-mined GitHub opportunities. Save what looks buildable. Let Codex pick if you are lazy.

OSS Goldmine deals one GitHub-based startup opportunity at a time. It is a daily opportunity feed for builders and their AI coding agents.

![OSS Goldmine preview](./docs/assets/oss-goldmine-preview.svg)

## Human-Readable, Agent-Readable

This repo has two interfaces:

- Humans swipe the web demo.
- Agents start with `AGENTS.md`, then read `opportunities.json`, `daily/current.md`, and `prompts/`.

If you do not want to browse cards yourself, paste this repo into Codex, Claude, Cursor, or another coding agent and ask it to pick the best opportunity for you.

## Why This Exists

Builders do not need more lists.

They need a fast answer to one question:

```text
Is there a small product opportunity hiding inside this open-source demand?
```

OSS Goldmine scans GitHub signals, turns them into one-card startup opportunities, and keeps the output readable by both humans and agents.

## Try It

Live demo:

```text
https://tieguo-coder.github.io/OOS-Goldmine/
```

Local:

```bash
npm install
npm run api
npm run dev
```

Open:

```text
http://127.0.0.1:5173/OOS-Goldmine/
```

## What Makes It Different

Most tools ask you to search, compare, and think.

OSS Goldmine does the first pass for you:

- One card at a time, not a noisy table.
- `Save` or `Skip`, not another dashboard to manage.
- Startup framing, not raw repo metadata.
- Evidence from stars, issues, stale work, and maintainer activity.
- Machine-readable output so Codex, Claude, Cursor, or another coding agent can read it.

## Use It With Codex

This repo is designed to be read by agents.

Fast prompt:

```text
Read this OSS Goldmine repo.
Pick the 3 opportunities that best fit an AI builder who wants small developer tools.
For each one, explain why to build, watch, or ignore it.
```

Ready-made prompts:

- [`prompts/pick-opportunity.md`](./prompts/pick-opportunity.md)
- [`prompts/build-from-card.md`](./prompts/build-from-card.md)
- [`prompts/profile-fit.md`](./prompts/profile-fit.md)

Agent-readable data lives in:

- [`AGENTS.md`](./AGENTS.md)
- [`llms.txt`](./llms.txt)
- [`opportunities.json`](./opportunities.json)
- [`daily/current.md`](./daily/current.md)
- [`docs/GOLDEN_CARDS.md`](./docs/GOLDEN_CARDS.md)

Daily card template:

- [`templates/opportunity-card.md`](./templates/opportunity-card.md)

## Today's Sample Cards

| Opportunity | Source signal | First test |
| --- | --- | --- |
| Lightweight Postman migration helper | Legacy API testing demand around `brookshi/Hitchhiker` | Compare two API collections and export a migration report |
| React render regression detector | React perf pain around `react-perf-devtool` | Turn profiler output into a shareable regression report |
| Debugger migration checklist | Old Node debugger demand around `node-inspector` | Generate modern VS Code and Chrome DevTools migration checks |

## How It Works

1. Web demo lets people swipe one opportunity card at a time.
2. This repo keeps the daily brief, source evidence, and machine-readable data.
3. Codex / Claude / Cursor can read the repo and pick what fits the builder.
4. The light workflow story is scan, judge, package, deliver, and remember.

## Workflow Loop

OSS Goldmine is a small public artifact that shows the shape of an agent workflow:

```text
scan -> judge -> package -> deliver -> remember
```

Built as an agent-run opportunity workflow.

The repo is useful on its own, but it also hints at the bigger idea: agents can run ongoing work streams where they keep searching, judging, and delivering results.

## Scope

- GitHub only.
- One card at a time.
- Local browser memory.
- No login in the first version.
- No repo shaming.
- No clone recommendations.
- No investment advice.

## Launch Copy

See [LAUNCH.md](./LAUNCH.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Open an issue if you want to suggest an opportunity card or report a false positive.

## License

MIT
