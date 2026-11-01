# Contributing / 参与贡献

欢迎改进文档、可访问性、使用体验、CSV可靠性和测试。Please keep changes focused and explain the user-visible outcome.

## Before a change / 修改前

阅读 [AGENTS.md](AGENTS.md)、[README](README.md) 或 [English README](README.en.md)。使用虚构数据复现问题；不要提交真实客户、财务、健康资料、上传背景、密钥、绝对个人路径或运行日志。

Read the project instructions and reproduce issues with fictional data. Never submit real user records, credentials, private filesystem paths, or original hosting metadata.

## Verification / 验证

```shell
npm ci
npm run typecheck
npm test
npm run build:local
```

涉及页面请检查桌面与320/375px窄屏，说明浏览器与设置；无法验证的部分如实记录。Data/schema changes should include migration compatibility and round-trip/relationship tests. Avoid changing the storage architecture or introducing model/network dependencies as an unrelated side effect.

## Pull requests / 提交说明

说明修改目的、范围、实际测试、截图（仅虚构数据）和已知限制。Keep Chinese and English READMEs aligned when public behavior changes. Agent-generated changes must receive the same review as other contributions; do not claim client integration or tests that were not run.

贡献前请确认有权提交相关代码和素材，并保留第三方版权声明。Original contributions are intended to be made under this project's MIT license; third-party material keeps its applicable terms.

依赖变更后，成功执行npm ci，再运行 `node scripts/prepare-distribution.mjs` 刷新许可证声明及复刻蓝本的依赖元数据；该命令仅整理本地文件，不发布。After dependency changes, regenerate local notices and review them before distribution.
