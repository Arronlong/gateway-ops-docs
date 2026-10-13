# 安全、升级与备份

## 安全基线

1. 公网部署时设置 `AUTH_ENABLED=true`，并填写强管理员密码。
2. 将 Web 服务放在启用 HTTPS 的反向代理之后；默认只绑定回环地址，不要为了方便将服务端口直接暴露到公网。
3. 保持 PostgreSQL 端口仅对本机或受控内网开放。
4. 妥善保管 `.env`、`APP_SECRET`、数据库备份和管理员凭据，不要把它们上传到公开仓库或粘贴到日志中。
5. 启用通知、代理或第三方 CAPTCHA 服务时，仅授予所需权限并定期检查凭据。

`APP_SECRET` 用于解密已有敏感数据。更换或丢失该值可能使已有凭据无法恢复。备份数据库时必须同时保护该密钥。

## 备份数据库

默认数据库用户和名称均为 `gatewayops`。如果部署时修改过它们，请替换命令中的值。

```bash
docker compose exec -T postgres pg_dump -U gatewayops gatewayops > gatewayops-backup.sql
```

同时安全备份 `.env`，特别是 `APP_SECRET`、数据库密码和管理员凭据。备份文件应限制访问，并定期执行恢复演练。

## 恢复数据库

先启动 PostgreSQL，再将备份导入目标数据库：

```bash
docker compose up -d postgres
docker compose exec -T postgres psql -U gatewayops -d gatewayops < gatewayops-backup.sql
```

恢复后启动应用并检查登录、渠道凭据解密、历史数据和任务状态。不要用另一套 `APP_SECRET` 恢复加密数据。

## 升级

1. 阅读目标版本的发布说明，确认配置或数据库迁移要求。
2. 备份数据库和 `.env`。
3. 确保 `app.image` 指向 GHCR；默认使用 `latest`，固定版本时同步调整 `GATEWAYOPS_IMAGE_TAG` 和镜像标签。
4. 拉取并重建应用：

```bash
docker pull ghcr.io/arronlong/gateway-ops:latest
docker compose up -d --no-build app
docker compose logs -f app
```

从本地源码构建时使用 `docker compose up -d --build app`。确认 `/healthz` 返回正常，并抽查登录、渠道读取和中转站同步。

不要通过删除 PostgreSQL volume 来回滚升级。需要回滚时，先确认旧版本兼容性，并在受控维护窗口内使用升级前备份恢复。
