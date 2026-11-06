# 规则覆盖与维护

本页面向文档维护者，记录已对照的实现范围。普通用户按 [业务规则总览](/logic/index) 阅读；实现更新时用这里定位需要同步修改的说明。

## 本轮覆盖范围

文档对照主项目 `v1.1.2` 标签提交 `63bdd8a`，核对 `v1.1.1..v1.1.2` 的 9 个提交及正式 Release。覆盖独立全渠道每日核对与手动执行、页面自动校对取消、Sub2API 分页报告、HTTP / HTTPS 代理及安全出口、分组持久快照和固定范围、三项健康评分与环形调整、分位速度、缩略图回读恢复及紧凑时间弹层。旧版 `v1.1.1` 固定为文档提交 `2ac69f3`；日期按北京时间记录，见 [产品更新记录](/reference/changelog)。

| 功能 / 规则 | 文档入口 | 主要实现来源（主项目相对路径） |
| --- | --- | --- |
| 后台每日核对、手动执行、默认时区与范围 | [渠道历史核对与回补](/logic/channel-usage-history) | `backend/internal/scheduler/channel_usage_integrity.go`、`backend/internal/monitor/usage_history_all.go`、`backend/internal/api/task_runs.go` |
| 渠道代理校验、加密、请求隔离与测智出口 | [渠道代理与请求出口](/logic/channel-proxy) | `backend/internal/networkproxy/proxy.go`、`backend/internal/api/proxies.go`、`backend/internal/relay/channel_proxy.go` |
| 分组固定区间快照、日明细复用与计算频率 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/group_monitor_snapshot.go`、`backend/internal/storage/relay_group_monitor.go`、`backend/internal/scheduler/group_monitor.go` |
| 自定义时间、时区、首页统计与利润参考 | [指标口径](/logic/metrics) | `frontend/lib/time-range.ts`、`backend/internal/api/time_range.go`、`backend/internal/api/dashboard.go` |
| 渠道历史条数核对、分段回补与连续断点 | [渠道历史核对与回补](/logic/channel-usage-history) | `backend/internal/api/channel_usage_history.go`、`backend/internal/monitor/usage_history_sync.go`、`usage_checkpoint.go`、`usage_newapi.go`、`backend/internal/connector/usage_limiter.go` |
| 测智持久缩略图与受控并发 | [鹈鹕测智](/logic/pelican-testing) | `backend/internal/api/pelican_thumbnail.go`、`backend/internal/storage/pelican_thumbnail.go`、`frontend/lib/pelican-thumbnail-store.ts`、`pelican-thumbnails.ts` |
| 路由拆包、gzip 与前端资源缓存 | [备份与升级](/deploy/security-backup-upgrade) | `frontend/src/main.tsx`、`backend/internal/api/frontend_assets.go` |
| 余额下降、归零恢复、每日基线 | [渠道余额](/logic/channel-consumption) | `backend/internal/storage/rates.go`：`ChannelConsumptionTotals`、`CaptureDailyBalances` |
| 多账号采集、调用回填与认证 | [渠道管理](/guide/channels) | `backend/internal/monitor/service.go`、`backend/internal/channel/service.go`、`backend/internal/storage/channel_usage.go` |
| 成本汇总、未知成本与覆盖 | [成本与倍率](/logic/cost-accounting) | `backend/internal/api/operations.go`、`backend/internal/api/operation_costs.go`、`backend/internal/relay/service.go` |
| 账本充值与采购联动 | [成本与倍率](/logic/cost-accounting) | `backend/internal/storage/operations.go` |
| 历史自动关联清理与显式绑定 | [成本与倍率](/logic/cost-accounting) | `backend/internal/storage/relay_stations.go`、`backend/internal/relay/service.go` |
| 综合评分、时间稳定性、输出速度与百分位 | [延迟与稳定性](/logic/latency-and-stability) | `frontend/lib/latency.ts`、`backend/internal/relay/latency_buckets.go`、`backend/internal/api/channel_usage.go` |
| 近期 Token 缓存、TPS 和三项账号评分 | [缓存指标与健康评分](/logic/cache-and-health-score) | `frontend/lib/recent-request-metrics.ts`、`frontend/lib/latency.ts`、`backend/internal/connector/newapi/cache_metrics.go` |
| 全局品牌、名称与图片校验、公开读取 | [系统设置](/guide/system-settings)、[配置项](/reference/configuration) | `backend/internal/storage/branding.go`、`backend/internal/api/branding.go`、`system_settings.go`、`frontend/lib/branding.ts`、`frontend/components/product-branding.tsx`、`system/branding-settings-card.tsx` |
| TPS 聚合、样本排除、封顶评分与独立排序 | [缓存指标与健康评分](/logic/cache-and-health-score) | `frontend/lib/recent-request-metrics.ts`、`recent-request-metrics.test.ts`、`frontend/components/monitor/recent-request-metrics.tsx`、`channel-cards.tsx`、`frontend/app/relay-stations-page.tsx` |
| 无关联渠道直连、结果归属与空列表兼容 | [渠道管理](/guide/channels)、[测智规则](/logic/pelican-testing) | `backend/internal/api/channel_pelican.go`、`backend/internal/relay/pelican.go`、`pelican_upstream.go`、`backend/internal/storage/pelican.go`、`channel_pelican.go`、`frontend/lib/pelican-library.ts`、`pelican-sources.ts`、`frontend/components/monitor/channel-pelican-panel.tsx` |
| 渠道测智 Key、NewAPI 调用与 Sub2API 回退 | [渠道管理](/guide/channels)、[鹈鹕测智](/logic/pelican-testing) | `backend/internal/channel/pelican_key.go`、`backend/internal/relay/pelican_upstream.go`、`backend/internal/relay/pelican.go`、`backend/internal/storage/channel_pelican.go`、`frontend/components/monitor/channel-pelican-panel.tsx` |
| 统一渠道认证 Header 与会话变量 | [渠道管理](/guide/channels)、[访问与显示策略](/logic/security-and-access) | `backend/internal/connector/connector.go`、`backend/internal/connector/newapi/newapi.go`、`backend/internal/connector/sub2api/sub2api.go`、`frontend/components/monitor/channel-form-dialog.tsx` |
| 公开分组持久快照、近期采样、最终结果及过期状态 | [公开页面的数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/group_monitor.go`、`group_monitor_metrics.go`、`group_monitor_metrics_test.go`、`frontend/lib/public-relay-monitor.ts`、`frontend/app/public-relay-monitor-page.tsx` |
| 统计时长、最近数量与保存 | [系统设置](/guide/system-settings) | `backend/internal/storage/settings.go`、`backend/internal/api/system_settings.go`、`frontend/app/system-settings-page.tsx` |
| 多来源测智、方案启用、生成中记录、单次参数、作品删除与沙箱 | [鹈鹕测智](/logic/pelican-testing) | `backend/internal/relay/pelican.go`、`pelican_upstream.go`、`group_pelican.go`、`backend/internal/storage/pelican_settings.go`、`pelican_schedule.go`、`pelican_sources.go`、`frontend/components/relay/pelican.tsx` |
| 自动任务执行状态、日志、分页与重启中断 | [定时任务执行历史](/logic/task-execution-history) | `backend/internal/scheduler/task_runs.go`、`backend/internal/storage/task_runs.go`、`backend/internal/api/task_runs.go`、`frontend/components/system/task-history.tsx` |
| Sub2API Token 独立定时维护 | [同步与数据处理](/logic/synchronization) | `backend/internal/channel/token_refresh.go`、`backend/internal/monitor/token_refresh.go`、`backend/internal/scheduler/token_refresh.go` |
| New API 管理适配、权限与能力边界 | [New API 中转站](/logic/newapi-relay) | `backend/internal/relay/newapi_admin.go`、`backend/internal/relay/newapi_operations.go`、`backend/internal/relay/newapi_reporting.go` |
| 关联账号范围与近期调用匹配 | [调用对比](/logic/call-comparison) | `frontend/lib/channel-relay-association.ts`、`frontend/lib/recent-call-comparison.ts` |
| 时间桶对齐、悬停与调用明细 | [调用对比](/logic/call-comparison) | `frontend/lib/relay-compare-bucket.ts`、`frontend/components/monitor/latency-stability-lane.tsx`、`frontend/components/monitor/channel-relay-compare.tsx` |
| 跨站近期样本查询 | [调用对比](/logic/call-comparison) | `backend/internal/api/relay_stations.go`、`frontend/lib/queries.ts` |
| 风险、候选、自动调组与降级 | [自动调组](/logic/auto-group-adjustment) | `backend/internal/relay/risk.go`：`evaluateAccountRiskWithOptions`、`applyAutomaticAdjustments` |
| 自动优先级与召回 | [自动优先级](/logic/auto-priority) | `backend/internal/relay/risk.go`：`automaticPriorityTargetsWithRecall` |
| 运行参数、克隆、探测与测试 | [账号操作与测试](/logic/account-operations) | `backend/internal/relay/risk.go`、`backend/internal/relay/service.go` |
| 本地匹配、状态与采购 | [本地号池](/logic/local-account-lifecycle) | `backend/internal/storage/operations.go` |
| 用户注册风险与管理员保护 | [用户风险识别](/logic/user-risk) | `backend/internal/relay/service.go`：`registrationIPs`、`userRiskScore`、`DeleteUsers` |
| 同步顺序、任务重叠与保留 | [同步与数据处理](/logic/synchronization) | `backend/internal/scheduler/scheduler.go`、`backend/internal/storage/settings.go`、`backend/internal/relay/service.go` |
| 预警对象分类、指标、阈值、状态、采集与属性过滤 | [预警判定](/logic/alerts-and-automation) | `backend/internal/alert/{collector,collector_scope,conditions,state,scope,validation}.go`、`frontend/components/alerts/rule-form.ts`、`alert-rule-dialog.tsx` |
| 远端启停所有权、人工介入、多规则约束及动作审计 | [安全自动化](/logic/alerts-and-automation) | `backend/internal/alert/automation.go`、`backend/internal/relay/alert_automation.go`、`backend/internal/storage/alerts.go` |
| 预警渠道关联、发送冷却与恢复重试 | [预警通知](/logic/alerts-and-automation) | `backend/internal/alert/service.go`、`backend/internal/notify/dispatcher.go`、`backend/internal/storage/notifications.go` |
| 通知订阅、阈值、冷却、重试 | [通知规则](/logic/notifications-and-captcha) | `backend/internal/notify/dispatcher.go`、`backend/internal/notify/policy.go`、`backend/internal/notify/subscription.go` |
| CAPTCHA 与登录 | [验证码规则](/logic/notifications-and-captcha) | `backend/internal/channel/service.go`、`backend/internal/captcha` |
| 公开监控与最终失败合并 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/group_monitor.go` |
| 价格覆盖、独立生图与缓存 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/model_pricing.go` |
| 官方状态、按天历史与 DeepSeek 官方可用率 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/api/public_service_status.go`、`deepseek_service_status.go`、`frontend/app/public-service-status-page.tsx` |
| 启动默认值、环境映射与 Compose | [配置项](/reference/configuration) | `backend/internal/config/config.go`、`backend/config.example.yaml`、`docker-compose.yml`、`.env.example` |
| 认证、密钥、页面隐藏与 iframe | [访问策略](/logic/security-and-access) | `backend/cmd/server/main.go`、`backend/internal/crypto/cipher.go`、`backend/internal/api/frame_policy.go`、`backend/internal/security/hostglob.go` |
| 版本 API、更新与镜像发布 | [版本与更新](/reference/versions) | `backend/internal/version/version.go`、`backend/internal/api/version.go`、`frontend/components/system/version-card.tsx`、主项目 `.github/workflows/publish.yml` |

这里只列可帮助回查的关键来源，不是全量 API 端点清单。连接器能否读取某项上游字段，仍取决于上游产品和版本。

## 变更时更新哪些文档

新增或修改指标时，补来源、公式、单位、窗口、空值和完整性；新增配置时，补默认值、范围、存储层及生效方式；修改处理逻辑时，补触发条件、跳过条件、远端写入、部分失败和示例。

同一算法只在规则页维护详细公式，使用指南保留操作入口和前提，再链接到规则页。新页面需进入侧边导航，并从相关指南链接，避免只有文件没有可发现入口。

## 本地验证

在独立文档仓库执行：

```bash
npm run docs:build
npm run docs:check
```

构建检查 VitePress 页面与站内路由；内容检查检查 UTF-8、异常字符、表格列数、内部链接 / 图片及导航覆盖。有锚点链接时同时核对构建后的页面 ID。
