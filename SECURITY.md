# Security Policy / 安全政策

## Supported Versions / 支持版本

OSS Goldmine is currently an MVP.

OSS Goldmine 目前是 MVP 阶段。

| Version / 版本 | Supported / 是否支持 |
| --- | --- |
| main | Yes / 支持 |

## Reporting a Vulnerability / 报告安全问题

Please do not open a public issue for sensitive vulnerabilities.

请不要用公开 issue 报告敏感安全问题。

For now, create a private report through GitHub's security advisory flow if available, or contact the repository owner directly.

目前请优先使用 GitHub security advisory / 安全公告流程提交私密报告；如果不可用，请直接联系仓库 owner。

## Token Handling / token 处理

OSS Goldmine accepts an optional GitHub token in the browser only to increase GitHub API rate limits.

OSS Goldmine 接受可选 GitHub token，仅用于提高 GitHub API 请求额度。

Current MVP behavior:

当前 MVP 行为：

- The token is not stored in a database / token 不存入数据库
- The token is not sent to an OSS Goldmine server / token 不发送到 OSS Goldmine 服务器
- The token is used directly by the browser when calling GitHub / token 由浏览器直接用于请求 GitHub

Do not paste tokens into issues, screenshots, pull requests, or public demos.

不要把 token 粘贴到 issue、截图、PR 或公开演示里。
