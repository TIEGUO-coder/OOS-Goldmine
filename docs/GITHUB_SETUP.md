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

## Public API

GitHub Pages only serves static files. Deploy the Node API separately before public launch.

Recommended path:

```text
Render -> New -> Blueprint -> connect this repository
```

This repository includes:

```text
render.yaml
```

After Render creates the service:

1. Add `GITHUB_TOKEN` as a secret environment variable in Render.
2. Open `https://your-api-host/health`.
3. Confirm it returns `{"ok":true}`.
4. Copy the API origin, for example `https://oss-goldmine-api.onrender.com`.

Then add a GitHub repository variable:

```text
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
Name: VITE_API_BASE_URL
Value: https://your-api-host
```

Re-run the `Build and Publish Demo` workflow after setting the variable.

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
- [ ] Public API `/health` returns `{"ok":true}`
- [ ] `VITE_API_BASE_URL` repository variable is set
- [ ] About description is filled
- [ ] Topics are added
- [ ] Issue templates appear when opening a new issue
- [ ] `npm run build` passes
- [ ] Launch post has repo and demo links
