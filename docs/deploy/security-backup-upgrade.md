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
3. 当前 Compose 默认指向 GHCR，在 `.env` 中将 `GATEWAYOPS_IMAGE_TAG` 设为已发布目标版本；旧模板还需检查 `app.image` 的仓库地址和标签变量。
4. 拉取配置中的同一标签并重新创建应用：

```bash
docker compose pull app
docker compose up -d --no-build app
docker compose logs -f app
```

跟随 `latest` 时先设置 `GATEWAYOPS_IMAGE_TAG=latest`，也可用 `docker pull ghcr.io/arronlong/gateway-ops:latest` 拉取。固定版本不能只拉 `latest`。

确认 `/healthz` 返回正常，在“系统设置 → 版本与更新”核对版本、提交号与构建时间，并抽查登录、渠道读取和中转站同步。更新检查只提供信息，不能代替镜像升级。源码构建与启动命令见 [Docker Compose 部署](/deploy/docker-compose)。

不要通过删除 PostgreSQL volume 来回滚升级。需要回滚时，先确认旧版本兼容性，并在受控维护窗口内使用升级前备份恢复。

## v1.0.5 预警升级检查

升级前备份 PostgreSQL 与原 `APP_SECRET`，首次启动检查预警规则、状态、事件、指标样本、动作与渠道关联表的结构同步结果。该标签通过启动时模型迁移同步预警结构，不把设计文档或实现计划当成可重复执行的 SQL。

旧通知配置继续兼容，New API、测智、任务记录和 Token 维护保留；新增预警规则不会替你确认目标安全。首次启用自动化前以小范围只通知规则检查对象、阈值、采集与恢复条件，详见 [预警中心](/guide/alerts)。

## v1.0.6 配置核对

升级后在系统设置核对方案独立开关与监控参数。旧测智方案缺少 `enabled` 字段时仍视为启用，不会因升级全部暂停；全局任务开关、来源自动开关与有效时段继续约束新执行。需要暂停某项方案时关闭并保存，已开始的一轮仍会完成。

最近数量未配置时使用 60，允许 1–200 的整数；统计时长仍默认 1 小时、允许 1–24 小时。修改后点击“保存监控设置”，不需重启；两项设置不改变采集间隔、历史保留、预警窗口或自动优先级规则。生成中结果会先于最终作品出现，成功 / 失败原位更新，具体见 [系统设置](/guide/system-settings) 和 [测智执行规则](/logic/pelican-testing)。

## v1.0.7 品牌与 TPS 核对

升级后未配置品牌的实例继续显示 `GatewayOps` 和默认 Activity 图标，无需手工补品牌键、新增环境变量、数据库表或文件存储服务。自定义品牌随现有 PostgreSQL 设置备份；名称与图标会出现在登录及公开页面，保存前先确认适合公开。品牌草稿保存成功才应用，修改设置不需重启。

TPS 复用现有统计时长和最近数量，默认仍为 1 小时、60 条；它是新增独立指标和排序，不改变原有四项健康权重或自动优先级。确认上游提供有效文字输出及耗时后再比较，缺失数据不补成零，见 [系统设置](/guide/system-settings) 与 [指标规则](/logic/cache-and-health-score)。

## v1.0.8 公开分组监控核对

本版复用已有统计时长和最近数量，默认仍为 1 小时、60 条，无需新增环境变量或独立数据库配置。按正常镜像升级流程更新后，检查公开分组页是否在延迟稳定性下方显示三项环形指标；前后端应来自同一版本，浏览器缓存会按第 3 版重新读取。

确认管理员凭据可完整读取分组用量及上游错误，两类任一失败会使近期指标不可用。首行成功率保留原最终请求口径，环形成功率保留有效重试尝试；原有历史范围、60 条明细、测智和健康评分没有改成同一种采样。检查方法见 [公开页面](/guide/public-pages) 和 [数据规则](/logic/public-monitor-and-pricing)。
