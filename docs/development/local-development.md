# 本地开发

本地开发需要 Node.js、pnpm、Go、PostgreSQL，以及 GatewayOps 所需的外部服务凭据。生产部署方式见 [Docker Compose 部署](/deploy/docker-compose)。

## 启动 PostgreSQL

准备一个可访问的 PostgreSQL 数据库。开发配置默认连接 `localhost:54329`，数据库名和用户为 `gatewayops`；可用 `backend/config.example.yaml` 作为配置参考。Compose 配置存在外部 Sub2API 网络和代理环境文件要求；若只需要本地数据库，应按本机环境调整网络依赖。

## 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

前端开发服务器默认监听 `http://localhost:3010`，并将 `/api`、`/healthz` 请求代理到 `http://localhost:8418`。

## 启动后端

在另一个终端运行：

```bash
cd backend
go mod download
go run ./cmd/server
```

后端默认监听 `8418`。设置数据库连接参数和稳定的 `APP_SECRET`；开发期不要复用生产密钥或生产数据库。

## 测试和构建

```bash
cd backend
go test ./...
```

```bash
cd frontend
pnpm exec vitest run
pnpm run build
pnpm run lint
```

具体测试范围以当前分支的 `package.json` 和 Go 模块为准。运行端到端流程前，准备隔离的测试数据库和不会产生真实费用的测试上游。

