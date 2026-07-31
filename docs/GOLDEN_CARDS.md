# Golden Opportunity Cards / 黄金机会卡

These cards are manually calibrated examples. They are used to judge whether OSS Goldmine is producing useful, respectful, builder-ready recommendations.

这些卡片是人工校准样例，用来判断 OSS Goldmine 是否真的能生成有用、尊重维护者、适合 builder 开工的推荐。

## 1. brookshi/Hitchhiker

Repository / 仓库: [brookshi/Hitchhiker](https://github.com/brookshi/Hitchhiker)

Category / 类别: API testing and collaboration / API 测试与协作

Verdict / 判断: `Adapt / 改造`

Recommended wedge / 推荐切口:

```text
API collection migration diff
API 集合迁移差异报告
```

Why it is a good gold sample / 为什么是好样本:

- Historical demand is visible through stars, forks, and many open issues / star、fork 和大量 open issue 能看到历史需求
- Maintenance is clearly slower than the demand surface / 维护速度明显慢于需求表面
- The original product space is too competitive to rebuild directly / 原产品赛道竞争太强，不适合直接复刻
- The useful wedge is narrower: migration, response diff, regression comparison / 更好的切口更窄：迁移、响应差异、回归对比

Do not recommend / 不推荐:

```text
Build a new Postman clone.
做一个新的 Postman 复刻品。
```

Recommend / 推荐:

```text
Build a companion tool that compares Postman, Insomnia, Hoppscotch, and legacy collections, then flags environment variables, request differences, and regression risks.

做一个配套工具，对比 Postman、Insomnia、Hoppscotch 和老 API 集合，标出环境变量、请求差异和回归风险。
```

## 2. nitin42/react-perf-devtool

Repository / 仓库: [nitin42/react-perf-devtool](https://github.com/nitin42/react-perf-devtool)

Category / 类别: React performance tooling / React 性能工具

Verdict / 判断: `Adapt / 改造`

Recommended wedge / 推荐切口:

```text
React render regression report
React 渲染回归报告
```

Why it is a good gold sample / 为什么是好样本:

- React performance pain is still real / React 性能痛点仍然存在
- Full browser devtools are hard to compete with / 完整浏览器 devtool 很难竞争
- A report-style companion is smaller and more shareable / 报告型配套工具更小，也更适合传播
- It fits AI builders: inspect traces, explain rerenders, suggest fixes / 适合 AI builder：检查 trace、解释重渲染、建议修复

Do not recommend / 不推荐:

```text
Build a full React DevTools replacement.
做完整 React DevTools 替代品。
```

Recommend / 推荐:

```text
Build a small tool that turns React profiling data into a shareable render regression report with suspicious components, wasted renders, and suggested fixes.

做一个小工具，把 React profiling 数据变成可分享的渲染回归报告，包含可疑组件、浪费渲染和修复建议。
```

## 3. dmtolpeko/sqlines

Repository / 仓库: [dmtolpeko/sqlines](https://github.com/dmtolpeko/sqlines)

Category / 类别: Database migration / 数据库迁移

Verdict / 判断: `Adapt / 改造`

Recommended wedge / 推荐切口:

```text
SQL migration compatibility report
SQL 迁移兼容性报告
```

Why it is a good gold sample / 为什么是好样本:

- Database migration has clear business pain / 数据库迁移有明确业务痛点
- Users need confidence before changing production systems / 用户在改生产系统前需要信心
- The wedge can be smaller than a full converter / 切口可以小于完整转换器
- A report-first tool can be useful even when it cannot auto-fix everything / 即使不能自动修复全部问题，报告优先工具也有价值

Do not recommend / 不推荐:

```text
Build a universal SQL converter.
做一个万能 SQL 转换器。
```

Recommend / 推荐:

```text
Build a compatibility scanner that reads SQL files, detects dialect-specific risks, estimates migration effort, and generates an AI-ready fix plan.

做一个兼容性扫描器，读取 SQL 文件，检测方言风险，估算迁移工作量，并生成 AI 可执行修复计划。
```

## Calibration Rules / 校准规则

- Prefer companion tools over full clones / 优先推荐配套工具，不推荐完整复刻
- If evidence is limited, downgrade to Watch / 如果证据受限，降级为观察
- If strong alternatives own the main workflow, recommend migration, diff, audit, or reporting wedges / 如果强竞品已经占据主流程，推荐迁移、差异、审计或报告切口
- Penalize personal config repositories and broad examples / 对个人配置仓库和宽泛示例项目扣分
- A high score without a clear wedge is not good enough / 高分但没有清晰切口仍然不够好
