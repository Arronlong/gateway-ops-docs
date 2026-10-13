# 发布文档站

本项目是与 GatewayOps 应用代码分开的 VitePress 文档站，使用 GitHub Actions 构建静态文件并部署到 GitHub Pages。部署源仓库应为独立的公开文档仓库。

## 第一次部署

1. 在 GitHub 账号 `Arronlong` 下创建公开仓库 `gateway-ops-docs`。创建时不要勾选初始化 README、License 或 `.gitignore`。
2. 在本地文档站目录执行：

```bash
git init -b main
npm ci
npm run docs:build
git add .
git commit -m "docs: initialize GatewayOps documentation"
git remote add origin https://github.com/Arronlong/gateway-ops-docs.git
git push -u origin main
```

3. 在 GitHub 打开文档仓库的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
5. 打开仓库的 **Actions** 页面，确认 `Deploy Docs` 工作流完成。
6. 发布地址为 <https://arronlong.github.io/gateway-ops-docs/>。

如果 GitHub 提示需要启用 Pages，先保存 Pages 来源设置，再重新运行失败的工作流。

## 后续更新

编辑 `docs/` 中的 Markdown 页面，在本地运行 `npm run docs:build` 检查构建，然后提交并推送到 `main`：

```bash
git add docs
git commit -m "docs: update product guidance"
git push
```

每次推送到 `main` 都会自动构建和发布。Pull Request 可以先运行本地构建检查；合并后再发布正式站点。

## 仓库名称或域名变更

GitHub 项目站点部署在仓库名对应的子路径下，`.github/workflows/deploy.yml` 为此设置：

```yaml
DOCS_BASE: /gateway-ops-docs/
```

如果仓库改名，将该值改成新的 `/<仓库名>/` 并重新发布。如果使用自定义域名，将 `DOCS_BASE` 改为 `/`，再按 GitHub Pages 设置配置 DNS 和 HTTPS。

## 可见性和敏感内容

GitHub Pages 发布内容可被网站访问者读取。公开仓库中只放置经过脱敏的示例、截图和操作说明；不要提交密钥、生产 URL、账号信息、内部代理地址或数据库备份。

