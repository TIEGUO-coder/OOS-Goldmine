# GitHub Repository Setup / GitHub 仓库设置

Use this checklist before public launch.

公开发布前使用这份清单。

## About Section / About 区

Go to the repository homepage and click the gear icon beside **About**.

进入仓库首页，点击 **About** 旁边的齿轮图标。

Recommended values:

推荐填写：

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

建议开启：

```text
Use your GitHub Pages website
Releases
Packages: off unless needed
```

## GitHub Pages / GitHub Pages

If the live demo is 404, go to:

如果在线 demo 是 404，进入：

```text
Settings -> Pages
```

Set:

设置：

```text
Source: Deploy from a branch
Branch: gh-pages
Folder: /root
```

The expected demo URL:

预期 demo 地址：

```text
https://tieguo-coder.github.io/OOS-Goldmine/
```

## Social Preview / 社交预览图

Go to:

进入：

```text
Settings -> General -> Social preview
```

Upload:

上传：

```text
docs/assets/oss-goldmine-preview.svg
```

If GitHub rejects SVG, export it to PNG first.

如果 GitHub 不接受 SVG，先导出为 PNG。

## First Labels / 初始 labels

Recommended issue labels:

推荐 issue labels：

```text
opportunity
false-positive
scoring
github-api
good-first-issue
documentation
launch
```

## Launch Readiness / 发布前检查

- [ ] README preview image renders / README 预览图正常显示
- [ ] Live demo opens / 在线 demo 可打开
- [ ] About description is filled / About 描述已填写
- [ ] Topics are added / topics 已添加
- [ ] Issue templates appear when opening a new issue / 新建 issue 时模板出现
- [ ] `npm run build` passes / 构建通过
- [ ] Launch post has repo and demo links / 发布文案包含 repo 和 demo 链接
