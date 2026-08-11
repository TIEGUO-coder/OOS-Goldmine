# AGENTS.md

This repository is designed to be read by coding agents.

## What This Repo Is

OSS Goldmine is a daily opportunity radar for builders.

It turns GitHub demand signals into small startup opportunity cards. Each card should help a builder decide whether to build, watch, or skip a narrow companion product.

## Read Order

When a user asks you to use this repo, read files in this order:

1. `README.md` - product context and positioning.
2. `opportunities.json` - structured opportunity data.
3. `daily/current.md` - current daily brief.
4. `docs/GOLDEN_CARDS.md` - calibration examples.
5. `prompts/` - reusable task prompts.

Do not start from the React source unless the user asks about implementation.

## Decision Rules

Prefer opportunities that are:

- Narrow enough for a solo builder or small team.
- Based on visible GitHub demand signals.
- Useful as companion tools, reports, audits, migration helpers, or workflow automations.
- Easy to validate in 48 hours.
- Respectful to the original open-source project and maintainers.

Avoid recommending:

- Full clones of existing projects.
- Broad platforms with unclear first users.
- Ideas that depend on replacing a maintainer.
- Ideas with weak evidence and no clear buyer/user.
- Anything framed as investment advice.

## Output Format

When choosing opportunities, respond with:

```text
Top pick:
- Opportunity:
- Why this one:
- First 48-hour test:
- Biggest risk:
- What not to build:

Watch:
- Opportunity:
- Why watch:
- Evidence needed:

Skip:
- Opportunity:
- Why skip:

Next action:
- One concrete thing the builder should do today.
```

## Build Plan Format

When turning a card into a build plan, include:

1. First version scope.
2. Explicit non-goals.
3. Inputs and outputs.
4. Data or fixtures needed.
5. Suggested technical approach.
6. Validation plan.
7. README positioning.
8. Demo script.
9. Launch angle.

Keep the first version small. The goal is not to rebuild the source repo; the goal is to test the smallest painful workflow around it.
