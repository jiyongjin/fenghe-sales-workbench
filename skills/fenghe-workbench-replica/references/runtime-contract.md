# 运行与接口契约

## 蓝本而非云站点复制

保留本地React界面、原生Node服务、CSV存储和测试；去除原项目Sites/Cloudflare/Vinext配置与站点身份。托管和本地不是同一能力：本包没有把原云站点授权一并复制，也不创建新部署。

已构建运行：Node.js>=22.13，`node server/local.mjs`；Windows双击启动CMD使用隐藏独立Node进程，不依赖WorkBuddy或Codex保持打开。电脑重启后仍需重新启动，未设置开机自启。首次运行在项目data创建虚构演示表，已有表保留。

源码开发：`npm ci` → `npm run build:local` → `npm run typecheck` → `npm test`。依赖版本来自原程序，package/lock是适配本地版的精简配置。`npm run dev`只是前端开发工具，真实CSV保存要配合同源服务，不能把开发页当完整运行版。

## 配置

- WORKBENCH_PORT：默认4318。端口冲突时为副本指定空闲端口，不杀已有进程。
- WORKBENCH_DATA_DIR：默认项目data。仅在用户明确授权时指向现用数据目录；验收使用自己的临时目录。
- 服务只监听127.0.0.1，允许Host为localhost/127.0.0.1与对应端口。
- 不需要模型Key。AI接入只是说明与后续清单，尚未实现真实模型调用。

PowerShell示例（仅当前终端生效）：

```powershell
$env:WORKBENCH_PORT='4328'
.\启动个人工作台.ps1 -NoBrowser
```

停止脚本应核验PID和完整server路径，不能按“所有node.exe”批量终止。启动/停止脚本保留原实现；如果环境阻止查询进程，要如实提示，不能声称已经停止，也不能通过全局降低执行策略补救。

## 接口

| 路径 | 请求/结果 |
| --- | --- |
| GET /api/bootstrap | tables、revisions、directory、mode=local、临时token；token不得放到文档或日志 |
| POST /api/records | {table,op:'upsert'或'delete',row,userId,expectedRevision}；返回新snapshot |
| POST /api/import | {table,rows,userId,expectedRevision}；当前人物ID合并，重复/跨人物冲突拒绝 |
| GET /api/export?table=tasks&user=人物ID | UTF-8 CSV；profiles导出所有人物（不是账号权限接口） |
| POST /api/background | {data:'data:image/png;base64,...'}，返回本地图片path |
| GET /data-assets/文件名 | 读取当前数据目录assets下图片 |

写入要求X-Workbench-Token=bootstrap token，并检查Origin（若提供）为同机同源。错误JSON为{error:文本}；无授权403，revision冲突409，其他校验通常400，文件缺失404。不虚构REST分页或不存在的AI接口。

背景仅PNG/JPEG/WebP，图片<=3MB；CSV导入客户端<=5MB、<=10000行；服务JSON请求<=8MB。路径遍历拒绝；不要开放任意文件读取/写入接口。

## 数据适配

同机页面自动连接本机API；通过文件夹授权可读写用户指定CSV目录；无连接时只能用虚构数据预览，保存应报未连接，不能悄悄写localStorage。浏览器File System能力与授权是否可用由实际运行环境决定。

手机访问云页面并不能直接访问电脑的127.0.0.1或文件；响应式、持久化、跨设备同步是三件事。本包只保证保留原本本机优先的模式，不擅自加入远程公网同步。

## 验证策略

`verify-replica.mjs`默认先比较蓝本哈希，接着在独立临时数据目录、自动分配测试端口启动副本，做真实HTTP写入与进程重启验证，最后关闭自己的子进程。它不使用副本或原程序的data目录。测试输出不得包含token、背景照片或真实数据内容。
