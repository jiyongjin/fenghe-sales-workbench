# Fenghe 个人工作台 · 本地独立蓝本

版权所有 © 2026 [风禾永进](https://yongjin.tech) · [MIT License](LICENSE)

这是可独立运行、可修改源码的本地版。数据默认在本目录的 data/，首次启动只创建缺失文件与虚构DEMO，不覆盖已有CSV。

## 直接运行

需要 Node.js 22.13 或以上。Windows双击“启动个人工作台.cmd”；不需要安装npm依赖，因为dist-local已构建。默认 http://127.0.0.1:4318/ 。停止使用“停止个人工作台.cmd”，不会删除数据。

复制出来的新项目若与原程序端口冲突，为副本选择别的端口，不停止其他服务。在PowerShell中：

```powershell
$env:WORKBENCH_PORT='4328'
.\启动个人工作台.ps1 -NoBrowser
```

其他系统可执行 `node server/local.mjs`，但该前台进程需要保持运行；本蓝本未提供macOS/Linux后台服务安装。不自动开机启动。

## 修改代码

```text
npm ci
npm run typecheck
npm test
npm run build:local
npm start
```

开发前端的 `npm run dev` 不代表CSV服务已经启动，正式验收请使用上面构建后的同源本机服务。

## 文件

- components/workbench/：真实界面、主题、四象限、灵感、复盘、同行。
- lib/workbench-model.mjs：13表字段、校验、DEMO；lib/csv.mjs：CSV编解码。
- server/：本机HTTP、CSV写入、备份和冲突保护。
- tests/：原有程序测试。
- dist-local/：可直接运行的已构建页面；修改源码后必须重新构建。

人物切换是数据分组，不是账号权限隔离。CSV明文保存，客户偏好默认遮挡但未加密。“同行”是未接模型的离线规则教练。手机样式已适配，不能因此直接访问另一台电脑的本地文件。

数据、背景照片、日志、密钥、原云站点身份未包含在蓝本中。请保留data/backups，迁移前停止服务并复制完整data。
