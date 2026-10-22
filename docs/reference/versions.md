# 版本与更新

本版文档已同步至 GatewayOps `v1.0.3`，对应标签提交 `15e7745`。`v1.0.3` 已于 2026 年 10 月 22 日发布，见 [GitHub Release](https://github.com/Arronlong/gateway-ops/releases/tag/v1.0.3)。应用版本从 `v1.0.0` 开始记录；源码默认版本及文档导航不是已发布镜像或 Release 的凭据。标签变更见 [产品更新记录](/reference/changelog)。

## 查看运行版本

打开“系统设置 → 版本与更新”，查看版本号、提交号和构建时间。点击“检查更新”查询 GitHub 的最新稳定 Release，再打开发布说明。检查更新不会拉取镜像、重启容器或修改运行版本；实际升级见 [安全、升级与备份](/deploy/security-backup-upgrade)。

| 版本示例 | 含义 |
| --- | --- |
| `1.0.3` | 当前文档对应的已发布稳定版本；正式构建由发布标签注入。 |
| `1.1.0-rc.1` | 预发布版本，供上线前验证。 |
| `1.0.0-dev.sha.<提交号>` | 开发构建；前缀取当前提交可达的最高稳定标签，没有时从 `1.0.0` 起算。 |

只创建 Git 标签而尚未公开 Release 时，GitHub 最新版本接口可能没有可查询版本。镜像工作流在所有已启用的镜像仓库准备好后公开 Release。

## 版本信息来源

| 构建方式 | 版本与构建信息 |
| --- | --- |
| 直接运行当前 Go 源码，未注入参数 | 默认 `1.0.1`，提交号和构建时间为 `unknown`；这是源码默认值，不代表正式发布版本。 |
| 本地 Docker 构建，未覆盖版本参数 | Dockerfile 默认 `1.0.1`；提交号和时间未注入时为 `unknown`。 |
| GitHub Actions 正式 / 预发布标签构建 | 版本取标签，构建时注入提交号与时间。 |
| GitHub Actions main 开发构建 | 生成 `<稳定版本基线>-dev.sha.<12 位提交号>`，并注入提交号与时间。 |

`channel` 根据版本字符串分类为 `stable`、`prerelease` 或 `development`。本地默认字符串也会归类为 `stable`，因此这个字段描述构建版本格式，不能单独证明该版本已公开发布。二进制也支持 `gateway-ops -version` 查看构建信息。

## 版本接口

`GET /api/version` 返回 `name`、`version`、`revision`、`build_time`、`repository` 和 `channel`。版本号通常不带 `v` 前缀，页面显示时加上 `v`。

`GET /api/version/check` 返回以下信息。两个接口都遵循后台认证；开启认证时需要有效登录凭据。

| 字段 | 含义 |
| --- | --- |
| `current_version` | 当前运行版本。 |
| `latest_version` | GitHub 最新稳定版号，有有效 Release 时返回。 |
| `update_available` | 是否有更高版本；无法判断时为 `null`。 |
| `status` | 比较结果，见下表。 |
| `release_url` | 对应 Release 发布说明地址。 |
| `published_at` | GitHub 记录的 Release 发布时间。 |
| `checked_at` | 实际查询时间；返回缓存时保持原查询时间。 |
| `error` | 查询或版本解析失败时的错误信息。 |

| `status` | HTTP 状态 | 含义 |
| --- | --- | --- |
| `update_available` | `200` | 有更高稳定版本，`update_available=true`。 |
| `up_to_date` | `200` | 当前与查询到的稳定版本相同。 |
| `current_newer` | `200` | 当前版本高于查询到的稳定版本。 |
| `no_release` | `200` | GitHub 未提供可用 Release，是否可更新为 `null`。 |
| `check_failed` | `502` | 限流、超时、远端异常或版本无效，是否可更新为 `null`。 |

查询固定使用公开仓库 `Arronlong/gateway-ops` 的 GitHub Releases API。Fork 后镜像发布地址会随仓库变化，但当前应用更新检查仍查询这个原始仓库。检查仅使用稳定 Release，不把草稿或预发布当作目标。

正常结果（包括没有 Release）缓存 5 分钟，查询失败缓存 1 分钟，同一进程合并并发查询，默认 HTTP 超时 8 秒。点击检查不会强制绕过缓存；限流、超时和没有 Release 都不能解释为“已是最新版”。版本比较使用语义化版本规则，支持规范化 `v` / `V` 前缀，构建元数据不影响排序。

## 镜像标签

| 标签 | 用途 |
| --- | --- |
| `1.0.3` / `v1.0.3` | 同一版本的两种固定标签；GHCR 已发布，可固定使用。 |
| `latest` | 已发布稳定版中最高的语义化版本；旧版本重跑不会回退。 |
| `1.1.0-rc.1` / `v1.1.0-rc.1` | 预发布镜像，不推进 `latest`。 |
| `edge` | 当前 main 分支的开发构建。 |
| `sha-<完整提交号>` | 开发构建的提交标签。 |

默认发布至 GHCR `ghcr.io/arronlong/gateway-ops`，Docker Hub 为可选发布目标。生产环境建议使用已发布固定版本，升级前查看发布说明并备份数据库及 `APP_SECRET`。

当前 Compose 模板默认指向 GHCR。跟随 `latest` 时，在 `.env` 设置 `GATEWAYOPS_IMAGE_TAG=latest`，然后运行：

```bash
docker pull ghcr.io/arronlong/gateway-ops:latest
docker compose up -d --no-build app
```

固定版本时，将 `GATEWAYOPS_IMAGE_TAG` 改为目标版本，再运行 `docker compose pull app` 和 `docker compose up -d --no-build app`。旧 Compose 文件还需确认 `app.image` 引用目标仓库与这个标签变量。

## 镜像发布配置

GHCR 使用工作流自动提供的 `GITHUB_TOKEN`，需允许 GitHub Actions 写入仓库内容及 Packages。默认镜像地址由当前 GitHub 仓库生成并转为小写，Fork 后自动发布至 Fork 所在仓库的 GHCR 地址。

在 GitHub 仓库的 `Settings → Secrets and variables → Actions` 中按需配置：

| 配置 | 类型 | 用途 |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Secret 或 Variable | Docker Hub 登录用户名；两处均设置时优先使用 Secret。 |
| `DOCKERHUB_TOKEN` | Secret | 具有目标镜像仓库写入权限的 Docker Hub 访问令牌。 |
| `DOCKERHUB_IMAGE` | Variable，可选 | 镜像地址，默认为 `<Docker Hub 用户名>/<GitHub 仓库名>`；也可指定组织仓库。 |
| `GHCR_IMAGE` | Variable，可选 | 覆盖默认 GHCR 镜像地址。 |

两个镜像地址变量均不包含标签。仅使用 GHCR 时无需 Docker Hub 配置；未配齐 Docker Hub 用户名和 Token 时提示并跳过 Docker Hub。配齐后同时发布两个仓库；此时 Docker Hub 登录或推送失败会使工作流报错。

## 产品版本发布

1. 在 main 合并代码并完成检查，确认配置与数据库兼容性。
2. 更新源码默认版本、Dockerfile 版本参数，以及对应产品文档的适用版本与更新记录。
3. 创建并推送目标版本标签。例如准备发布下一个补丁版本 `v1.0.4` 时：

```bash
git tag -a v1.0.4 -m "GatewayOps v1.0.4"
git push origin v1.0.4
```

4. 检查 `Publish GatewayOps` 工作流、所有已启用镜像仓库的固定标签、`latest` 及 GitHub Release。

版本标签会触发后端检查、多架构镜像构建和 Release 发布。只有所有已启用仓库核验成功后才公开 Release；仅发布 GHCR 时不执行 Docker Hub 的登录、推送或版本标签核验。同时发布两个仓库无法执行跨仓库原子事务；发布中断后可重跑，固定标签保留原摘要，发现冲突时失败。

发布后不要移动或复用 Git 标签。`latest` 只由最高稳定版本推进，main 开发构建和预发布都不推进它。修复使用补丁版本，兼容新功能使用次版本，不兼容变更使用主版本。文档文字修订用文档仓库提交号追溯，只有产品发布才增加产品版本号。
