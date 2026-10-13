# 配置参考

部署变量和默认值随版本变化。启动前以当前发布版本的 `.env.example`、`backend/config.example.yaml` 及系统设置页为准。

## Compose 环境变量

| 变量 | 用途 |
| --- | --- |
| `GATEWAYOPS_DATABASE_HOST` / `PORT` | PostgreSQL 连接地址和端口。 |
| `GATEWAYOPS_DATABASE_USER` / `PASSWORD` / `NAME` | 数据库用户、密码和名称。 |
| `GATEWAYOPS_POSTGRES_PORT` | Compose 暴露到宿主机的数据库端口。 |
| `GATEWAYOPS_HTTP_PORT` | Compose 暴露到宿主机的 Web 端口。 |
| `GATEWAYOPS_IMAGE_TAG` | 运行的 GatewayOps 镜像标签。 |
| `APP_SECRET` | 加密敏感配置的主密钥。 |
| `AUTH_ENABLED` | 后台认证开关；公网部署必须开启。 |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 后台登录凭据。 |
| `AUTH_TOKEN_SECRET` | 可选的登录 Token 签名密钥。 |
| `GATEWAYOPS_HTTP_PROXY` / `GATEWAYOPS_HTTPS_PROXY` / `GATEWAYOPS_NO_PROXY` | 应用访问外部服务时的代理设置。 |

配置示例和端口说明见 [部署配置](/deploy/configuration)。

## 后端配置类别

`backend/config.example.yaml` 展示后端配置的主要类别：

- `server`：监听端口、运行模式、外部访问地址和可信代理。
- `database`：PostgreSQL 地址、TLS、连接池和时区。
- `security` 与 `auth`：数据加密密钥及后台认证。
- `scheduler`：渠道任务周期、并发和历史数据保留期。
- `notifications`：倍率变更合并、变化幅度过滤、低余额冷却和发送重试。
- `log`：日志等级和格式。

Compose 环境变量可覆盖部分后端 YAML 设置。不要仅凭配置文件中的开发默认值判断生产环境当前生效值。

