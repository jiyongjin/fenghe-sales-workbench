# GitHub 源码发布 / Source publication

公开源码仓库：[jiyongjin/fenghe-sales-workbench](https://github.com/jiyongjin/fenghe-sales-workbench)，采用MIT许可。仓库分发源码、虚构DEMO、双语说明和通用智能体Skill；运行程序仍需在本机启动。

Public source repository: [jiyongjin/fenghe-sales-workbench](https://github.com/jiyongjin/fenghe-sales-workbench), licensed under MIT. The repository distributes source, fictional demos, bilingual documentation, and a portable agent skill. Run the application locally using the README instructions.

## 发布前 / Before publishing

1. 确认归属账号、公开范围及MIT选择。LICENSE使用项目贡献者集体署名；需个人/公司署名时确认主体后调整，不推测真实姓名。
2. 复核源码、素材和第三方声明。项目MIT不改变依赖各自许可证。
3. 只发布这个独立目录，不带原Git历史、托管身份或真实data；公开后被他人复制的信息不能保证收回。
4. 运行类型检查、测试、构建和复刻验收。检查中英文README，确认截图和DEMO均为虚构。
5. 在Git暂存预览中排除node_modules、真实CSV、照片、日志、token和私有路径。gitignore不能清理已提交历史。
6. 创建仓库、push或设为公开需用户明确授权。本包脚本不自动执行这些外部动作。

For future publications, confirm account ownership, visibility, name, license, and third-party terms. Use the sanitized directory, inspect staged files, and obtain explicit authorization for repository creation/publication.

## 仓库简介 / Repository description

中文：面向ToB销售的本地优先个人工作台，连接客户、商机、四象限、目标、生活、灵感与复盘；CSV持久化，支持通用智能体复刻与定制。

English: A local-first B2B sales workbench for customers, opportunities, actions, goals, life, ideas, and reviews, with CSV persistence and portable agent workflows.

Topics: `b2b-sales`, `local-first`, `productivity`, `csv`, `react`, `typescript`, `nodejs`, `ai-agents`, `skills`

## 源码与运行包 / Source and runtime packages

根dist-local是构建产物，由用户构建，不纳入源码提交。Skill内assets/blueprint/dist-local是有意附带的可运行参考蓝本，不含用户数据。

将来发布独立运行包时，只打包干净构建、服务/lib、启动脚本、LICENSE与第三方声明，不带真实data或node_modules。本次未创建GitHub Release。

## 参考 / References

- [GitHub licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [MIT](https://choosealicense.com/licenses/mit/)
- [MPL 2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
- [GitHub Pages is static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
