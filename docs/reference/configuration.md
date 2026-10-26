# 配置项

配置分为启动参数、部署编排变量、数据库持久化的页面设置和每个业务对象的局部配置。修改前先确认所在层级，不能把所有值都放进 `.env` 就认为已经生效。

## 加载顺序与生效方式

后端使用“环境变量优先于 YAML，YAML 优先于内置默认值”的顺序。通过 `-config` 指定文件；未指定时查找当前目录、`./backend` 和 `/etc/gateway-ops` 的 `config.yaml`。配置文件可选，但提供了错误格式的文件会使启动失败。

| 配置层 | 存储位置 | 生效方式 |
| --- | --- | --- |
| 后端启动参数 | 容器环境、挂载 YAML、命令行配置文件路径 | 重新创建 / 重启应用。 |
| Compose 变量 | 项目 `.env` | 只参与 Compose 插值；必须由 `environment` 或 `env_file` 传入容器。 |
| 同步任务与显示设置 | PostgreSQL | 页面保存后更新任务或显示，不要求重启。 |
| 渠道 / 中转站 / 账号配置 | PostgreSQL，部分操作同时写远端 | 按对应保存、同步和策略触发规则生效。 |

环境变量映射只把 YAML 路径中的点变成下划线，再转大写。驼峰单词不会额外拆开：`scheduler.balanceCron` 对应 `GATEWAYOPS_SCHEDULER_BALANCECRON`，不是 `GATEWAYOPS_SCHEDULER_BALANCE_CRON`。

## 服务、数据库与日志

下表列的是**后端内置默认值**。Compose 默认使用 `release` 模式、容器数据库端口 `5432`；宿主 Web 默认 `8080`，均与单独运行后端的默认值有所区别。

| YAML 配置 | 环境变量 | 内置默认值 / 用途 |
| --- | --- | --- |
| `server.port` | `GATEWAYOPS_SERVER_PORT` | `8418`，应用内部监听端口。 |
| `server.mode` | `GATEWAYOPS_SERVER_MODE` | `debug`，生产编排一般使用 `release`。 |
| `server.baseURL` | `GATEWAYOPS_SERVER_BASEURL` | `http://localhost:8418`，配置的外部访问地址。 |
| `server.trustedProxies` | `GATEWAYOPS_SERVER_TRUSTEDPROXIES` | 空列表；建议用 YAML 列表配置，该项没有单独注册无文件环境默认键。 |
| `database.host` | `GATEWAYOPS_DATABASE_HOST` | `localhost`。 |
| `database.port` | `GATEWAYOPS_DATABASE_PORT` | `54329`。 |
| `database.user` | `GATEWAYOPS_DATABASE_USER` | 无内置账号；示例为 `gatewayops`。 |
| `database.password` | `GATEWAYOPS_DATABASE_PASSWORD` | 无内置密码；示例不能作为生产密码。 |
| `database.name` | `GATEWAYOPS_DATABASE_NAME` | 无内置名称；示例为 `gatewayops`。 |
| `database.sslMode` | `GATEWAYOPS_DATABASE_SSLMODE` | `disable`。 |
| `database.timezone` | `GATEWAYOPS_DATABASE_TIMEZONE` | `Asia/Shanghai`，数据库连接时区。 |
| `database.maxOpenConns` | `GATEWAYOPS_DATABASE_MAXOPENCONNS` | `20`，最大打开连接数。 |
| `database.maxIdleConns` | `GATEWAYOPS_DATABASE_MAXIDLECONNS` | `5`，最大空闲连接数。 |
| `log.level` | `GATEWAYOPS_LOG_LEVEL` | `info`，示例支持 `debug / info / warn / error`。 |
| `log.format` | `GATEWAYOPS_LOG_FORMAT` | `text`，也可使用 `json`。 |

业务自然日窗口使用服务进程本地时区；Compose 通过 `TZ=Asia/Shanghai` 设置。不要只改数据库时区后就假设所有页面日期都会变化。

## 认证与密钥

| YAML 配置 | 环境变量 | 内置默认值 / 条件 |
| --- | --- | --- |
| `security.appSecret` | `APP_SECRET` | 必填非空；用于凭据加密，建议长期保存高强度随机值。 |
| `auth.enabled` | `AUTH_ENABLED` | `false`。 |
| `auth.username` | `ADMIN_USERNAME` | `admin`。 |
| `auth.password` | `ADMIN_PASSWORD` | 空；开启认证时必须配置。 |
| `auth.tokenSecret` | `AUTH_TOKEN_SECRET` | 空；启动时回退到 `APP_SECRET`。 |
| `auth.sessionTTLHours` | `GATEWAYOPS_AUTH_SESSIONTTLHOURS` | `168` 小时。 |

代码校验主密钥非空，并通过 SHA-256 派生加密密钥；“建议至少 32 字节随机值”是部署建议，不是当前长度校验。换密钥不会迁移旧密文，见 [访问与显示策略](/logic/security-and-access)。

## 启动调度与数据保留

cron 为含秒的 6 字段表达式。渠道保存过页面同步设置后，会使用页面完整同步任务覆盖启动时余额 / 倍率独立任务，见 [同步与数据处理](/logic/synchronization)。

| YAML 配置 | 环境变量 | 内置默认值 / 含义 |
| --- | --- | --- |
| `scheduler.balanceCron` | `GATEWAYOPS_SCHEDULER_BALANCECRON` | `37 */15 * * * *`。 |
| `scheduler.rateCron` | `GATEWAYOPS_SCHEDULER_RATECRON` | `13 */30 * * * *`。 |
| `scheduler.concurrency` | `GATEWAYOPS_SCHEDULER_CONCURRENCY` | `4`；不能据此认定所有采集与查询都共享这一并发度。 |
| `scheduler.retention.cron` | `GATEWAYOPS_SCHEDULER_RETENTION_CRON` | `0 17 3 * * *`；为空时不运行清理。 |
| `scheduler.retention.monitorLogsDays` | `GATEWAYOPS_SCHEDULER_RETENTION_MONITORLOGSDAYS` | `30`；设为 0 不清理。 |
| `scheduler.retention.balanceSnapshotsDays` | `GATEWAYOPS_SCHEDULER_RETENTION_BALANCESNAPSHOTSDAYS` | `90`；设为 0 不清理。 |
| `scheduler.retention.notificationLogsDays` | `GATEWAYOPS_SCHEDULER_RETENTION_NOTIFICATIONLOGSDAYS` | `90`；设为 0 不清理。 |

倍率变化日志不在上述定期清理范围内。保留期缩短会影响历史展示，不能用来替代备份。

## 通知策略

| YAML 配置 | 环境变量 | 内置默认值 / 含义 |
| --- | --- | --- |
| `notifications.batchRateChanges` | `GATEWAYOPS_NOTIFICATIONS_BATCHRATECHANGES` | `true`，按通知渠道合并同轮倍率变化。 |
| `notifications.minChangePct` | `GATEWAYOPS_NOTIFICATIONS_MINCHANGEPCT` | `0`，百分比阈值；0 不过滤。 |
| `notifications.balanceLowCooldownMinutes` | `GATEWAYOPS_NOTIFICATIONS_BALANCELOWCOOLDOWNMINUTES` | `60` 分钟；0 不冷却。 |
| `notifications.sendMaxAttempts` | `GATEWAYOPS_NOTIFICATIONS_SENDMAXATTEMPTS` | `3` 次，包含首次；1 不重试。 |

这些属于后端启动配置，当前不能仅凭页面保存通知渠道就修改全部全局策略。完整边界见 [通知与验证码规则](/logic/notifications-and-captcha)。

## 页面保存的任务配置

| 字段 | 尚未配置时的页面默认值 | 保存规则 |
| --- | --- | --- |
| `channel_enabled` | `false` | 保存后替代旧渠道任务模式。 |
| `channel_interval_minutes` | `30` | 小于 1 时归一为 30 分钟。 |
| `channel_token_refresh_enabled` | `false` | 独立开启 Sub2API Token 维护，不替代渠道监控开关。 |
| `channel_token_refresh_interval_minutes` | `30` | 接口要求大于等于 1 的整数分钟。 |
| `relay_rate_enabled` | `false` | 配置且开启后才定时探测。 |
| `relay_rate_interval_seconds` | `10` | 小于 5 秒时优先兼容正分钟字段，否则回退 10 秒。 |
| `relay_snapshot_enabled` | `false` | 配置且开启后才定时同步快照。 |
| `relay_snapshot_interval_seconds` | `3600` | 小于 5 秒时优先兼容正分钟字段，否则回退 3600 秒。 |

中转站秒字段优先，分钟字段用于兼容旧设置。一次保存会记录原有渠道同步、倍率探测、快照三类任务均已配置；关闭任务也会保存，不会自动恢复旧启动 cron。Token 刷新是独立的第四类维护任务，只处理启用监控的 Sub2API Token 模式凭据，详见 [同步与数据处理](/logic/synchronization)。

显示设置中，运营目录、渠道页面以及倍率变化、渠道信息、近期调用、分组、稳定性、消费模块默认显示；分组默认不展开。iframe 默认关闭、模式为 `allowlist`、白名单为空。父级关闭保留子项值，隐藏不会停任务。

监控指标时间窗 `recent_metrics_window_hours` 默认 1 小时，允许 1–24 的整数，保存在 PostgreSQL 的页面设置中。它统一影响渠道和中转站账号的缓存命中率、重试感知成功率、综合评分及对应排序；修改后需点击“监控指标”卡片的“保存监控设置”，或“界面与页面”标题行的“保存界面与监控设置”。该窗口不调整后台采集间隔或数据保留期，详见 [缓存指标与健康评分](/logic/cache-and-health-score)。

中转站局部自动策略默认均关闭，召回等待默认 180 分钟（15–10080）；账号并发 / 手动优先级允许 1–1000，同账号重试允许 0–10。详见 [自动调组](/logic/auto-group-adjustment)、[自动优先级](/logic/auto-priority) 和 [账号操作与测试](/logic/account-operations)。

## 鹈鹕测智设置

以下是系统设置 API 的字段，持久化到 PostgreSQL；不是需要加入 `.env` 的启动变量。通过“保存测智设置”生效，不需要重启。

| 字段 | 默认值 | 范围与说明 |
| --- | --- | --- |
| `pelican_page_enabled` | `true` | 控制作品展示与公开分组作品入口，不暂停生成。 |
| `pelican_tasks_enabled` | `true` | 控制新手动 / 定时生成；来源自动开关仍默认关闭。 |
| `pelican_plans` | 1 项，模型空、默认题目、`medium` | 1–8 项，每项含 `model`、`prompt`、`reasoning_effort`；每轮各执行一次。 |
| `pelican_cron_expression` | `*/30 * * * *` | 五段 Cron，结合下列时区与有效时段。 |
| `pelican_active_timezone` | `Asia/Shanghai` | 已保存的运行时区，不自动取浏览器 / 服务器时区。 |
| `pelican_active_start` / `pelican_active_end` | `08:00` / `22:00` | `HH:mm`，含开始、不含结束；相等为全天，支持跨午夜。 |
| `pelican_active_weekdays` | `[0,1,2,3,4,5,6]` | 0 为周日、6 为周六，至少一天，不重复；跨午夜按开始日判断。 |
| `pelican_history_count` | `30` | 每个账号 / 分组 1–100 份，含失败结果；调低立即删除旧作品。 |

旧的 `pelican_model`、`pelican_prompt`、`pelican_reasoning_effort` 保留兼容，当前以方案列表为准；不要继续按旧 `pelican_parallel_count` 理解重复生成数量。账号 / 分组自动开关和单次参数与全局字段分离，详见 [鹈鹕测智与作品历史](/logic/pelican-testing)。

## Compose 专用变量与出站代理

`GATEWAYOPS_HTTP_PORT` 默认 `8080`、`GATEWAYOPS_POSTGRES_PORT` 默认 `54329`，控制宿主映射。当前 `app.image` 默认是 `ghcr.io/arronlong/gateway-ops:${GATEWAYOPS_IMAGE_TAG:-latest}`，在 `.env` 中修改 `GATEWAYOPS_IMAGE_TAG` 可选择已发布版本，未设置时跟随 `latest`。旧模板若没有这个仓库和变量引用，还需先调整 `app.image`；标签变量不会更换镜像仓库。拉取与升级见 [Docker Compose 部署](/deploy/docker-compose)。

当前 Compose 读取 `.outbound-proxy.env`，并只显式透传其 `environment` 列出的配置。`.env.example` 的 `GATEWAYOPS_HTTP_PROXY / GATEWAYOPS_HTTPS_PROXY / GATEWAYOPS_NO_PROXY` 不是当前后端 YAML 字段，也未由该 Compose 自动映射为标准代理变量；只写进 `.env` 不会自动启用出站代理。

需要代理时在容器环境提供 `HTTP_PROXY / HTTPS_PROXY / NO_PROXY`，可通过 `env_file` 或显式映射，示例见 [部署配置](/deploy/configuration)。`172.31.0.1:7890` 只是特定主机的示例地址，应替换为容器可达地址或清空。

## 预警数据库设置

v1.0.5 的预警总开关与频率通过 `GET/PUT /api/alerts/settings` 持久化，不是启动环境变量，也尚无独立前端设置表单。默认开启，评估固定 60 秒；倍率与用量各默认 60 秒、允许 60–120 秒；余额默认 300 秒、允许 300–600 秒。规则阈值、属性过滤及通知冷却分别保存在规则中，具体字段与范围见 [预警判定与安全自动化](/logic/alerts-and-automation)。
