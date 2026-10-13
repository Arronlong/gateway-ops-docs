# 部署配置

Compose 部署先配置项目根目录 `.env`，再确认需要的变量确实被传入应用容器。后端 YAML、环境变量与页面设置的全部默认值见 [配置项](/reference/configuration)。

## 必需配置

| 配置 | 用途 | 建议 |
| --- | --- | --- |
| `GATEWAYOPS_DATABASE_PASSWORD` | PostgreSQL 密码。 | 使用独立强密码。 |
| `APP_SECRET` | 加密渠道凭据、通知配置和中转站 API Key。 | 长期保存高强度随机值，建议至少 32 字节。 |
| `AUTH_ENABLED` / `ADMIN_PASSWORD` | 后台认证及管理员密码。 | 公网部署开启认证，并配置强密码。 |

主密钥不能随意更换；恢复数据库时必须使用配套密钥。当前代码只校验主密钥非空，推荐长度属于安全建议。

## 容器端口与宿主端口

| 项目 | 当前 Compose 默认值 | 含义 |
| --- | --- | --- |
| 应用内部端口 | `8418` | 容器内服务端口。 |
| `GATEWAYOPS_HTTP_PORT` | `8080` | 默认映射到宿主 `127.0.0.1`。 |
| `GATEWAYOPS_POSTGRES_PORT` | `54329` | 默认只向宿主回环映射数据库。 |
| 数据库地址与内部端口 | `gatewayops-postgres:5432` | 应用在 Compose 网络中连接数据库。 |
| 数据库用户、名称 | `gatewayops` | 可通过对应变量覆盖。 |
| 服务模式 / 日志等级 | `release` / `info` | 与后端单独运行的默认模式不同。 |
| `TZ` | `Asia/Shanghai` | 影响进程自然日统计窗口。 |

当前 Compose 的 `app.image` 默认是 `ghcr.io/arronlong/gateway-ops:${GATEWAYOPS_IMAGE_TAG:-latest}`。在 `.env` 中设置 `GATEWAYOPS_IMAGE_TAG` 即可选择标签，例如已经发布的 `1.0.1`；未设置时跟随 `latest`。旧模板需先核对镜像仓库。拉取命令与完整部署步骤见 [Docker Compose 部署](/deploy/docker-compose)。

## 透传额外启动参数

例如调整通知尝试次数，需要在 `app.environment` 增加映射，再在 `.env` 配置数值：

```yaml
services:
  app:
    environment:
      GATEWAYOPS_NOTIFICATIONS_SENDMAXATTEMPTS: ${GATEWAYOPS_NOTIFICATIONS_SENDMAXATTEMPTS:-3}
```

这里只展示需要并入现有 Compose 的片段，不是替换完整文件。修改环境变量后执行：

```bash
docker compose up -d --no-build app
docker compose logs --tail=100 app
```

只执行容器内部进程刷新或只修改未透传的 `.env` 字段，不会使新的启动配置自动生效。

## 使用 YAML 配置文件

需要维护列表或更多参数时，可挂载配置文件并指定路径：

```yaml
services:
  app:
    volumes:
      - ./config.yaml:/etc/gateway-ops/config.yaml:ro
    command: ["-config", "/etc/gateway-ops/config.yaml"]
```

环境变量仍会覆盖同名 YAML 配置。配置文件可参考源码 `backend/config.example.yaml`；不要将示例数据库密码或主密钥直接用到生产环境。

## 出站代理

当前应用容器引用 `.outbound-proxy.env`。不需要代理时可按部署指南创建空文件。需要时使用容器内标准代理变量，或者在 Compose 显式映射项目变量：

```yaml
services:
  app:
    environment:
      HTTP_PROXY: ${GATEWAYOPS_HTTP_PROXY:-}
      HTTPS_PROXY: ${GATEWAYOPS_HTTPS_PROXY:-}
      NO_PROXY: ${GATEWAYOPS_NO_PROXY:-gatewayops-postgres,postgres,localhost,127.0.0.1}
```

代理地址必须从应用容器可达；示例宿主地址不是所有系统通用。避免在 `env_file` 和 `environment` 设置冲突的代理值，后者会覆盖前者。

## 页面设置与后端启动设置

同步周期、页面显示、iframe 策略保存后动态生效；通知全局阈值、数据库、后台认证和保留期属于启动配置。渠道任务保存过页面设置后使用页面完整同步模式，见 [同步与数据处理](/logic/synchronization)。

反向代理应配置 HTTPS，并转发到正确宿主端口。可信代理列表、iframe 和认证有不同作用，见 [访问与显示策略](/logic/security-and-access)。
