# Docker Compose 部署

GatewayOps 的生产容器由 Go 服务、内嵌前端和 PostgreSQL 组成。Compose 默认将 Web 端口和 PostgreSQL 端口绑定到本机回环地址；公网访问通常应通过受控的反向代理，并开启后台认证。

## 环境要求

- Docker Engine 与 Docker Compose 插件。
- 至少 2 GB 可用内存，具体资源需求取决于同步频率和数据规模。
- 稳定保存 `.env` 中的 `APP_SECRET` 和数据库密码。
- 如果要管理 Sub2API 中转站，应用容器必须能访问 Sub2API 管理 API。

## 获取源码与准备环境

```bash
git clone https://github.com/Arronlong/gateway-ops.git
cd gateway-ops
cp .env.example .env
```

编辑 `.env`，至少替换 `GATEWAYOPS_DATABASE_PASSWORD` 和 `APP_SECRET`。公网部署还必须设置：

```bash
AUTH_ENABLED=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=请替换为强密码
```

不要将 `.env` 提交到 Git。`.env.example` 中的代理配置只是示例；没有代理时清空相关代理变量，使用代理时改成部署环境可达的地址。

## Compose 附加依赖

当前 Compose 配置还会读取 `.outbound-proxy.env`。如果部署目录中没有该文件且不使用这组代理变量，可创建空文件，或在确认用途后从 Compose 配置中移除 `env_file` 段。

Compose 默认加入名为 `sub2api-deploy_sub2api-network` 的外部 Docker 网络。创建网络：

```bash
docker network create sub2api-deploy_sub2api-network
```

如果 Sub2API 不在同一 Docker 主机，按实际路由配置访问地址；如果不使用中转站管理，可从 Compose 中移除应用服务对该外部网络的引用以及文件末尾对应的外部网络声明。

## 启动服务

```bash
docker compose up -d --build
docker compose ps
```

默认 Web 地址为 `http://127.0.0.1:8080`。默认宿主机 PostgreSQL 端口为 `127.0.0.1:54329`；应用容器内部连接数据库使用 `gatewayops-postgres:5432`。

检查健康接口：

```bash
curl http://127.0.0.1:8080/healthz
```

正常响应为：

```json
{"status":"ok"}
```

## 常用运维命令

使用 GHCR 发布镜像时，将 `docker-compose.yml` 中 `app.image` 设置为以下地址：

```yaml
image: ghcr.io/arronlong/gateway-ops:${GATEWAYOPS_IMAGE_TAG:-latest}
```

```bash
docker compose ps
docker compose logs -f app
docker pull ghcr.io/arronlong/gateway-ops:latest
docker compose up -d --no-build app
docker compose stop
docker compose start
```

使用源码构建时运行 `docker compose up -d --build app`。生产环境建议将 `GATEWAYOPS_IMAGE_TAG` 锁定到明确版本，不要依赖浮动的 `latest`。

`docker compose down` 会停止并移除容器，但不会自动删除命名数据卷。不要在没有备份的情况下运行带 `-v` 的清理命令。
