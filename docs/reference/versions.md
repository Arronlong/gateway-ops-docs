# 版本与更新

本版文档适用于 GatewayOps `v1.0.0`。应用正式版本从 `v1.0.0` 开始，以主仓库 Git 标签和 GitHub Release 为准。

## 查看运行版本

打开“系统设置 → 版本与更新”，查看版本号、提交号和构建时间。点击“检查更新”查询 GitHub 上的最新稳定 Release，并打开对应发布说明。

- `1.0.0`：正式版本。
- `1.1.0-rc.1`：预发布版本，供上线前验证。
- `1.0.0-dev.sha.<提交号>`：开发构建，不能视为已发布正式版本。

只创建 Git 标签而尚未发布 Release 时，GitHub 最新版本接口可能没有可查询版本。当前镜像工作流在所有已启用的镜像仓库准备好后会自动创建并发布 Release。

## 版本接口

`GET /api/version` 返回 `name`、`version`、`revision`、`build_time`、`repository` 和 `channel`。本地没有注入构建信息时版本默认为 `1.0.0-dev`，提交号和构建时间为 `unknown`。

`GET /api/version/check` 返回以下信息。开启后台认证时，此接口要求登录凭据。

| 字段 | 含义 |
| --- | --- |
| `current_version` | 当前运行版本。 |
| `latest_version` | GitHub 最新稳定版号，有可用 Release 时返回。 |
| `update_available` | 是否有更高版本；无法判断时为 `null`。 |
| `status` | `update_available`、`up_to_date`、`current_newer`、`no_release` 或 `check_failed`。 |
| `release_url` | GitHub 对应版本发布说明。 |
| `checked_at` | 实际查询时间；返回缓存时保持原查询时间。 |

查询使用公开仓库 `Arronlong/gateway-ops` 的 GitHub Releases API。正常结果缓存 5 分钟，查询失败缓存 1 分钟；GitHub 限流、超时或尚无 Release 不会被解释为“已是最新版”。

## 镜像标签

| 标签 | 用途 |
| --- | --- |
| `1.0.0` / `v1.0.0` | 同一正式版本的两种固定标签。 |
| `latest` | 语义化版本最高的已发布稳定版；旧版本重跑不会回退。 |
| `1.1.0-rc.1` / `v1.1.0-rc.1` | 预发布镜像，不推进 `latest`。 |
| `edge` | 当前 main 分支的开发构建。 |
| `sha-<完整提交号>` | 开发构建的固定提交标签。 |

默认发布至 GHCR `ghcr.io/arronlong/gateway-ops`，Docker Hub 为可选发布目标。生产环境建议使用固定版本，升级前查看发布说明并备份数据库及 `APP_SECRET`。

```bash
# 使用 latest；固定版本时同步替换标签和 Compose 镜像配置
docker pull ghcr.io/arronlong/gateway-ops:latest
docker compose up -d --no-build app
```

## 维护者发布流程

### 镜像仓库配置

GHCR 使用工作流自动提供的 `GITHUB_TOKEN`，需允许 GitHub Actions 写入仓库内容及 Packages。默认镜像地址由当前 GitHub 仓库生成并转为小写，Fork 后自动发布至 Fork 所在仓库的 GHCR 地址。

在 GitHub 仓库的 `Settings → Secrets and variables → Actions` 中按需配置：

| 配置 | 类型 | 用途 |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Secret 或 Variable | Docker Hub 登录用户名；两处均设置时优先使用 Secret。 |
| `DOCKERHUB_TOKEN` | Secret | 具有目标镜像仓库写入权限的 Docker Hub 访问令牌。 |
| `DOCKERHUB_IMAGE` | Variable，可选 | 镜像地址，默认为 `<Docker Hub 用户名>/<GitHub 仓库名>`；也可指定组织仓库。 |
| `GHCR_IMAGE` | Variable，可选 | 覆盖默认 GHCR 镜像地址。 |

两个镜像地址变量均不包含标签。仅使用 GHCR 时无需 Docker Hub 配置；未配齐 Docker Hub 用户名和 Token 时会提示并跳过 Docker Hub。配齐后同时发布两个仓库；此时 Docker Hub 登录或推送失败会使工作流报错。

### 发布步骤

1. 在 main 合并代码并完成测试，检查配置与数据库兼容性。
2. 同步修改独立文档仓库的内容和 `docs/release.json` 中的 `app_version`。
3. 在应用仓库创建并推送版本标签：

```bash
git tag -a v1.0.0 -m "GatewayOps v1.0.0"
git push origin v1.0.0
```

4. 检查 `Publish GatewayOps` 工作流、所有已启用镜像仓库的固定标签、`latest` 及 GitHub Release。
5. 提交并推送文档仓库，检查 Pages 部署。文档页面显示适用应用版本和文档修订号。

只有所有已启用仓库核验成功后才公开 Release；仅发布 GHCR 时不执行 Docker Hub 的登录、推送或版本标签核验。同时发布两个仓库时无法执行跨仓库原子事务；发布中断后可重跑，固定标签保留原摘要。

发布后不要移动或复用 Git 标签。后续修复使用 `v1.0.1`，增加兼容功能使用 `v1.1.0`，不兼容变更使用 `v2.0.0`。文档文字修订使用文档仓库提交号追溯，只有产品发布才增加产品版本号。
