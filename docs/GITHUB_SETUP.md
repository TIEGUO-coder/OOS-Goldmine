# GitHub Repository Setup

Use this checklist before public launch.

## About Section

Go to the repository homepage and click the gear icon beside **About**.

Recommended values:

```text
Description:
Find open-source projects where demand is alive but maintenance is fading.

Website:
https://tieguo-coder.github.io/OOS-Goldmine/

Topics:
github
open-source
oss
ai-builder
idea-discovery
indie-hacker
developer-tools
github-api
vite
react
```

Enable:

```text
Use your GitHub Pages website
Releases
Packages: off unless needed
```

## GitHub Pages

If the live demo is 404, go to:

```text
Settings -> Pages
```

Set:

```text
Source: Deploy from a branch
Branch: gh-pages
Folder: /root
```

Expected demo URL:

```text
https://tieguo-coder.github.io/OOS-Goldmine/
```

## Social Preview

Go to:

```text
Settings -> General -> Social preview
```

Upload:

```text
docs/assets/oss-goldmine-preview.svg
```

If GitHub rejects SVG, export it to PNG first.

## First Labels

Recommended issue labels:

```text
opportunity
false-positive
scoring
github-api
good-first-issue
documentation
launch
```

## Launch Readiness

- [ ] README preview image renders
- [ ] Live demo opens
- [ ] About description is filled
- [ ] Topics are added
- [ ] Issue templates appear when opening a new issue
- [ ] `npm run build` passes
- [ ] Launch post has repo and demo links
