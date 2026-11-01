# 本地发布准备验证 / Local release-preparation validation

日期 / Date: 2026-11-01。环境 / Environment: Windows, Node.js 24.13.0。

## 实际通过 / Passed locally

- `npm ci --no-audit --no-fund`：从锁文件安装成功；精简依赖26个本机安装包。
- `npm run typecheck`：通过。
- `npm test`：10项应用测试通过。
- `npm run build:local`：构建成功；保留原版界面/服务实现。
- `node scripts/check-docs.mjs`：中英文说明及其他Markdown相对链接检查通过；不代表每个外部URL都已验证。
- Skill格式校验通过；复制66个含许可证/声明的蓝本文件，无哈希差异。
- 通用Skill程序验收7组通过：13表/2虚构人物、静态资源、非法写入、revision冲突、手记来源关系、导出/复盘、重启恢复。
- 复刻验收使用独立临时数据与测试端口，没有读写原程序真实data。

## 发布内容 / Publication contents

准备目录名为fenghe-sales-workbench，项目MIT许可，含第三方声明和57个锁定依赖的许可证元数据；实际分发义务按上游条款与分发内容核对。依赖元数据清单不构成法律审计。

The release directory contains source, bilingual READMEs, general-agent instructions, a portable skill, fictional fixtures, and license notices. Real user data, credentials, node_modules, logs, and original hosting/Git history are excluded from the source package.

## 未宣称 / Not claimed

- 本页记录本地验收结果；没有GitHub Actions或Release运行记录。
- 没有宣称所有智能体客户端已导入实测或提供了专属连接器。
- 本轮未重做浏览器视觉验收；图片是历史DEMO截图。
- 尚无英文UI切换；英文文档不是英文界面的承诺。
- 未连接大模型、远程数据同步、公网鉴权或开机自启。
- Node22/macOS/Linux未进行完整矩阵验证；没有把Node24/Windows通过推论成所有平台通过。

Actual agent-host imports and browser visuals require separate verification. The original application and earlier WorkBuddy-specific package remain unchanged.
