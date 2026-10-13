# 快速开始

本页用 Docker Compose 启动 GatewayOps。生产环境部署前，请完整阅读 [Docker Compose 部署](/deploy/docker-compose) 和 [安全、升级与备份](/deploy/security-backup-upgrade)。

## 准备环境

- 已安装 Docker Engine 和 Docker Compose 插件。
- 如需运营 Sub2API 中转站，GatewayOps 与 Sub2API 需要网络可达。
- 为数据库准备独立密码，并为 `APP_SECRET` 准备至少 32 字节的随机字符串。

## 获取配置

```bash
git clone https://github.com/Arronlong/gateway-ops.git
cd gateway-ops
cp .env.example .env
```

Windows PowerShell 可使用：

```powershell
git clone https://github.com/Arronlong/gateway-ops.git
Set-Location gateway-ops
Copy-Item .env.example .env
```

编辑 `.env`，至少修改数据库密码和 `APP_SECRET`。公网部署时同时设置 `AUTH_ENABLED=true`、`ADMIN_USERNAME` 和强密码 `ADMIN_PASSWORD`。

当前 Compose 文件还引用 `.outbound-proxy.env`。如果不使用该代理文件，请创建空文件，或在确认代理配置用途后移除 Compose 中对应的 `env_file` 项。Compose 默认加入名为 `sub2api-deploy_sub2api-network` 的外部网络；网络不存在时请先创建，或按 [部署说明](/deploy/docker-compose) 调整网络配置。

## 启动并检查

```bash
docker compose up -d --build
docker compose ps
```

默认 Web 地址为 `http://127.0.0.1:8080`。检查健康状态：

```bash
curl http://127.0.0.1:8080/healthz
```

正常时返回 `{"status":"ok"}`。如果健康检查未通过，先查看 `docker compose logs -f app` 和 [常见问题](/reference/troubleshooting)。

## 首次配置

1. 使用管理员账号登录；确认公网环境已开启认证。
2. 在“渠道管理”添加 NewAPI 或 Sub2API，测试登录并执行完整同步。
3. 配置通知渠道和订阅规则，验证测试消息能够送达。
4. 如需中转站运营，添加 Sub2API 中转站并执行实时同步。
5. 登录 Sub2API 管理后台，为每个销售分组创建并启用分组 API Key，再回到 GatewayOps 执行同步。
6. 检查模型价格、成本采集完整性和风险建议后，再启用自动调组或自动优先级。

不要在未理解账号成本和建议规则之前开启自动调整。分组快速测试是真实请求，可能消耗额度并写入调用记录。
