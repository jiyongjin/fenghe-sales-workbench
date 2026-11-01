# Security and privacy / 安全与隐私

This application is designed for local personal use. It is not a hardened public, multi-tenant service.

- 只监听127.0.0.1；不要仅修改监听地址就部署公网。Public deployment needs a separate authentication, authorization, storage, and security design.
- 人物切换不是账号隔离；CSV明文，遮挡不是加密。Anyone with access to your data directory may read those files.
- 不要把真实data、背景图、日志、token或客户/财务/健康资料提交到GitHub或模型上下文。Use generated or sanitized fixtures.
- `.gitignore` does not remove files already tracked in Git or erase history. If a secret is exposed, revoke/rotate it and assess repository history and existing copies.
- Scripts should operate only within their declared output/test scope. Verify third-party skills before allowing execution.

## Reporting / 报告问题

不要在公开Issue中发布可利用的敏感细节、真实资料或密钥。联系仓库维护者使用其提供的私下渠道；如果GitHub Private Vulnerability Reporting已经启用，可使用该入口。本项目目前不承诺该功能已启用或某个响应时限。

Do not post secrets or live records in public issues. Use a private maintainer channel, or GitHub Private Vulnerability Reporting if the repository enables it. No unverified contact address or response SLA is implied.
