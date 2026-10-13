# 部署配置

Compose 部署主要通过项目根目录的 `.env` 配置。更细的后端参数可参考源码仓库中的 `backend/config.example.yaml`。应用页面中的同步设置会覆盖相应的周期任务设置；具体作用范围见 [系统设置](/guide/system-settings)。

## 必需配置

| 配置 | 用途 | 建议 |
| --- | --- | --- |
| `GATEWAYOPS_DATABASE_PASSWORD` | PostgreSQL 密码 | 使用独立的强密码。 |
| `APP_SECRET` | 加密渠道凭据、通知密钥和中转站管理员 API Key | 使用至少 32 字节随机值，并长期保存。 |

## 服务与数据库

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `GATEWAYOPS_HTTP_PORT` | `8080` | 宿主机 Web 端口，默认只绑定 `127.0.0.1`。 |
| `GATEWAYOPS_POSTGRES_PORT` | `54329` | 宿主机数据库映射端口，默认只绑定 `127.0.0.1`。 |
| `GATEWAYOPS_DATABASE_HOST` | `gatewayops-postgres` | Compose 网络中的数据库容器名。 |
| `GATEWAYOPS_DATABASE_PORT` | `5432` | PostgreSQL 容器端口。 |
| `GATEWAYOPS_DATABASE_USER` | `gatewayops` | 数据库用户。 |
| `GATEWAYOPS_DATABASE_NAME` | `gatewayops` | 数据库名称。 |
| `GATEWAYOPS_SERVER_MODE` | `release` | 服务器运行模式。 |
| `GATEWAYOPS_LOG_LEVEL` | `info` | 日志等级。 |
| `GATEWAYOPS_IMAGE_TAG` | `latest` | GatewayOps 镜像标签；生产环境建议锁定版本。 |

## 登录与代理

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `AUTH_ENABLED` | `false` | 是否要求后台登录。任何公网部署都应开启。 |
| `ADMIN_USERNAME` | `admin` | 管理员账号。 |
| `ADMIN_PASSWORD` | 空 | 开启认证时必填强密码。 |
| `AUTH_TOKEN_SECRET` | 空 | 登录 Token 签名密钥；为空时使用 `APP_SECRET`。 |
| `GATEWAYOPS_HTTP_PROXY` | 空 | 应用访问外部 HTTP 服务时使用的代理。 |
| `GATEWAYOPS_HTTPS_PROXY` | 空 | 应用访问外部 HTTPS 服务时使用的代理。 |
| `GATEWAYOPS_NO_PROXY` | 内置默认值 | 不经过代理的主机列表。 |

代理地址必须从应用容器网络内可达。不要照抄 `.env.example` 中可能属于特定主机的示例地址。

## 后台任务与保留期

后端示例配置中的渠道余额监控默认每 15 分钟执行，渠道倍率监控默认每 30 分钟执行。中转站快照同步和倍率探测分别配置；快照同步不会代替倍率探测。渠道自动同步可在渠道管理页设置。

示例配置默认每天清理 30 天前的监控日志、90 天前的余额快照和通知日志；倍率变更记录长期保留。实际值以部署版本的配置文件和系统设置页面为准。

## 站点网络与访问

- 反向代理应转发到宿主机映射的 Web 端口，并配置 HTTPS。
- 不要将 PostgreSQL 端口直接暴露到公网。
- 如果配置了 iframe 嵌入，使用系统设置中的来源白名单限制允许嵌入的站点。
- 配置变更后使用 `docker compose up -d app` 重新创建应用容器，并查看日志确认启动成功。
