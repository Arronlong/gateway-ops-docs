# GatewayOps 文档站

GatewayOps 的产品文档、部署指南、业务规则和架构说明。文档站使用 VitePress 构建，部署目标为 GitHub Pages。

## 本地预览

环境要求：Node.js 20 或更高版本、npm。

```bash
npm ci
npm run docs:dev
```

打开终端显示的本地地址。构建静态站点并预览：

```bash
npm run docs:build
npm run docs:preview
```

## 发布到 GitHub Pages

1. 创建公开 GitHub 仓库 `Arronlong/gateway-ops-docs`，不要初始化 README、License 或 `.gitignore`。
2. 在本目录初始化 Git 并推送 `main` 分支：

```bash
git init -b main
git add .
git commit -m "docs: initialize GatewayOps documentation"
git remote add origin https://github.com/Arronlong/gateway-ops-docs.git
git push -u origin main
```

3. 打开仓库的 **Settings → Pages**，将 **Build and deployment → Source** 设为 **GitHub Actions**。
4. 推送到 `main` 后，`Deploy Docs` 工作流会自动构建并发布。
5. 发布完成后访问 <https://arronlong.github.io/gateway-ops-docs/>。

如果仓库名不同，需要同步修改 `.github/workflows/deploy.yml` 中的 `DOCS_BASE`。如果使用自定义域名，通常将该值设为 `/`，并在 Pages 设置中配置域名。

## 文档约定

本版文档对照 GatewayOps `v1.1.0` 标签提交 `61401b8` 整理；应用实际版本、正式 Release 与镜像状态以主仓库 GitHub 为准。产品发布时同步维护 `docs/release.json` 中的 `app_version` 和 `docs/versions.json` 的 `latest`；先把上一版本的 `working-tree` 固定为更新前已提交的文档 SHA，再新增当前版本的 `working-tree`，避免旧文档随主分支变化。文档站导航和页脚展示当前版本；每次构建还会注入文档仓库提交号。版本及镜像发布规则见 `docs/reference/versions.md`。

- `docs/` 是面向用户和维护者的公开内容，不放真实密钥、内部地址或生产数据。
- 业务口径以当前 GatewayOps 实现为准；产品行为变化时，同步检查相关文档。
- 用户操作写在「使用指南」，计算口径和状态判定写在「业务规则与指标」，部署参数写在「配置参考」。
- 图片必须来自可公开分享的界面截图，并遮盖账号、地址、密钥和业务数据。
