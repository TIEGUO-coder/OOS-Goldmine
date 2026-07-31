# OSS Goldmine / 开源金矿

> Find open-source projects where demand is alive but maintenance is fading, then turn them into AI-ready build opportunities.
>
> 发现 GitHub 上需求仍然活跃、但维护正在变慢的开源项目，并生成适合 AI builder 开工的机会卡。

![OSS Goldmine status](https://img.shields.io/badge/status-MVP-f0b84f)
![License](https://img.shields.io/badge/license-MIT-315640)
![GitHub only](https://img.shields.io/badge/source-GitHub-18201b)

![OSS Goldmine preview](./docs/assets/oss-goldmine-preview.svg)

OSS Goldmine is not another abandoned repo list.

开源金矿不是又一个“废弃仓库列表”。

It asks the question builders actually care about:

它回答 builder 真正在意的问题：

**What can I build from this demand signal, without cloning the whole old project?**

**我能从这个需求信号里做出什么小产品，而不是复刻整个老项目？**

## Demo / 演示

Live demo / 在线演示:

[https://tieguo-coder.github.io/OOS-Goldmine/](https://tieguo-coder.github.io/OOS-Goldmine/)

Run it locally and search a builder topic such as:

本地运行后，可以搜索这些方向：

- `API testing tools`
- `React performance tools`
- `browser developer extensions`
- `OpenAPI security`
- `AI coding tools`

The app ships with sample cards, so the first screen is useful even before live GitHub search.

应用内置样例机会卡，所以打开后不搜索也能先看到效果。

## What It Generates / 输出什么

Each opportunity card includes:

每张机会卡包含：

- **Demand Gap Score / 需求缺口分**
- **Maintenance gap / 维护缺口**
- **Repeated issue themes / issue 重复主题**
- **Build / Adapt / Watch verdict / 构建、改造、观察判断**
- **Smallest useful wedge / 最小可做切口**
- **Evidence links / 证据链接**
- **AI Build Plan / AI 开工计划**

## Why It May Get Stars / 为什么可能拿 star

OSS builders love tools that help them find unfair starting points.

开源 builder 喜欢能帮他们找到“更好起点”的工具。

Most discovery tools stop at:

大多数发现工具停在：

> This repo is old.
>
> 这个仓库很老。

OSS Goldmine goes one step further:

开源金矿多走一步：

> Demand is still alive. Maintenance is fading. Here is the smallest useful thing to build next.
>
> 需求还活着，维护正在变慢。这里是下一个最小可做切口。

## How It Works / 工作方式

1. Search GitHub by topic / 按方向搜索 GitHub 项目
2. Pull repository and issue signals / 拉取仓库和 issue 信号
3. Score demand gap / 计算需求缺口
4. Classify the opportunity / 判断机会类型
5. Generate an AI-ready build brief / 生成 AI 可开工的构建简报

## Demand Gap Score / 需求缺口分

The score is intentionally simple and transparent:

这个分数故意保持简单、透明：

```text
Demand Gap Score =
  stars
  + open issues
  + quiet months
  + forks
  - penalties
```

Current MVP formula:

当前 MVP 公式：

```text
score =
  min(30, log10(stars + 1) * 9)
  + min(30, log2(open issues + 1) * 5)
  + min(25, quiet months * 1.35)
  + min(15, log10(forks + 1) * 6)
  - archived penalty
  - empty issue penalty
```

What each signal means:

每个信号的含义：

| Signal / 信号 | Meaning / 含义 |
| --- | --- |
| Stars / star 数 | Historical demand and attention / 历史需求和关注度 |
| Open issues / open issue 数 | Unresolved demand / 尚未解决的需求 |
| Quiet months / 静默月份 | Maintenance gap / 维护缺口 |
| Forks / fork 数 | Revival or adaptation interest / 接手或改造兴趣 |
| Penalties / 扣分项 | Archived repos or weak issue evidence / 已归档仓库或 issue 证据弱 |

This is not meant to be a final investment decision. It is a fast filter for builders.

它不是最终投资判断，而是给 builder 用的快速筛选器。

## Run Locally / 本地运行

```bash
npm install
npm run dev
```

Open:

打开：

```text
http://127.0.0.1:5173/
```

Build:

构建：

```bash
npm run build
```

## GitHub Token / GitHub token

A GitHub token is optional.

GitHub token 是可选的。

Without a token, GitHub anonymous API limits may be hit quickly. With a read-only token, searches are more reliable.

没有 token 也能试，但匿名 API 很容易限流。使用只读 token 后，搜索会更稳定。

Do not paste personal tokens into public screenshots, issues, or pull requests.

不要把个人 token 粘贴到公开截图、issue 或 PR 里。

## V1 Scope / 第一版范围

- GitHub only / 只接 GitHub
- No login / 不做登录
- No database / 不做数据库
- Optional read-only token / 可选只读 token
- Web demo first / 先做网页 demo
- Respect maintainers / 尊重维护者

## Non-goals / 不做什么

- Not a repo-shaming tool / 不是羞辱维护者的工具
- Not a clone generator / 不是复刻生成器
- Not a replacement for maintainers / 不是替代维护者
- Not a generic idea list / 不是泛泛的点子列表

## Roadmap / 路线图

See [ROADMAP.md](./ROADMAP.md).

查看 [ROADMAP.md](./ROADMAP.md)。

## License / 许可证

MIT
