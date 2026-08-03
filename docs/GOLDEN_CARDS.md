# Golden Opportunity Cards

These cards are manually calibrated examples. They help keep OSS Goldmine focused on useful, respectful, builder-ready demand-gap recommendations instead of vague repo hunting.

## 1. brookshi/Hitchhiker

Repository: [brookshi/Hitchhiker](https://github.com/brookshi/Hitchhiker)

Category: API testing and collaboration

Verdict: `Adapt`

Opportunity type: `Stalled`

Recommended wedge:

```text
API collection migration diff
```

Why it is a good gold sample:

- Historical demand is visible through stars, forks, and many open issues.
- Maintenance is clearly slower than the demand surface.
- The original product space is too competitive to rebuild directly.
- The useful wedge is narrower: migration, response diff, and regression comparison.

Do not recommend:

```text
Build a new Postman clone.
```

Recommend:

```text
Build a companion tool that compares Postman, Insomnia, Hoppscotch, and legacy collections, then flags environment variables, request differences, and regression risks.
```

## 2. nitin42/react-perf-devtool

Repository: [nitin42/react-perf-devtool](https://github.com/nitin42/react-perf-devtool)

Category: React performance tooling

Verdict: `Adapt`

Opportunity type: `Stalled`

Recommended wedge:

```text
React render regression report
```

Why it is a good gold sample:

- React performance pain is still real.
- Full browser devtools are hard to compete with.
- A report-style companion is smaller and more shareable.
- It fits AI builders: inspect traces, explain rerenders, and suggest fixes.

Do not recommend:

```text
Build a full React DevTools replacement.
```

Recommend:

```text
Build a small tool that turns React profiling data into a shareable render regression report with suspicious components, wasted renders, and suggested fixes.
```

## 3. dmtolpeko/sqlines

Repository: [dmtolpeko/sqlines](https://github.com/dmtolpeko/sqlines)

Category: Database migration

Verdict: `Adapt`

Opportunity type: `Stalled`

Recommended wedge:

```text
SQL migration compatibility report
```

Why it is a good gold sample:

- Database migration has clear business pain.
- Users need confidence before changing production systems.
- The wedge can be smaller than a full converter.
- A report-first tool can be useful even when it cannot auto-fix everything.

Do not recommend:

```text
Build a universal SQL converter.
```

Recommend:

```text
Build a compatibility scanner that reads SQL files, detects dialect-specific risks, estimates migration effort, and generates an AI-ready fix plan.
```

## Calibration Rules

- Prefer companion tools over full clones.
- If evidence is limited, downgrade to `Watch`.
- If strong alternatives own the main workflow, recommend migration, diff, audit, or reporting wedges.
- Penalize personal config repositories and broad examples.
- A high score without a clear wedge is not good enough.
