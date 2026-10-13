# 规则覆盖与维护

本页面向文档维护者，记录已对照的实现范围。普通用户按 [业务规则总览](/logic/index) 阅读；实现更新时用这里定位需要同步修改的说明。

## 本轮覆盖范围

文档对照主项目 `v1.0.1` 源码与提交 `e668765` 整理；功能基线是主仓库 `docs/releases/v1.0.0.md` 记录的 `a02f956`，本轮另核对 `4d5a704` 与 `e668765` 的提交说明及实现，见 [产品更新记录](/reference/changelog)。自动策略、采样统计、现金与调用成本、配置生效、公开视图及批量副作用均有独立说明；代码提交与正式 Release 可能不同，应以实例提交号核对。

| 功能 / 规则 | 文档入口 | 主要实现来源（主项目相对路径） |
| --- | --- | --- |
| 时间窗口、首页统计与利润参考 | [指标口径](/logic/metrics) | `backend/internal/api/dashboard.go`、`frontend/app/relay-stations-page.tsx` |
| 余额下降、归零恢复、每日基线 | [渠道余额](/logic/channel-consumption) | `backend/internal/storage/rates.go`：`ChannelConsumptionTotals`、`CaptureDailyBalances` |
| 多账号采集、调用回填与认证 | [渠道管理](/guide/channels) | `backend/internal/monitor/service.go`、`backend/internal/channel/service.go`、`backend/internal/storage/channel_usage.go` |
| 成本汇总、未知成本与覆盖 | [成本与倍率](/logic/cost-accounting) | `backend/internal/api/operations.go`、`backend/internal/api/operation_costs.go`、`backend/internal/relay/service.go` |
| 账本充值与采购联动 | [成本与倍率](/logic/cost-accounting) | `backend/internal/storage/operations.go` |
| 历史自动关联清理与显式绑定 | [成本与倍率](/logic/cost-accounting) | `backend/internal/storage/relay_stations.go`、`backend/internal/relay/service.go` |
| 综合评分、时间稳定性、输出速度与百分位 | [延迟与稳定性](/logic/latency-and-stability) | `frontend/lib/latency.ts`、`backend/internal/relay/latency_buckets.go`、`backend/internal/api/channel_usage.go` |
| 关联账号范围与近期调用匹配 | [调用对比](/logic/call-comparison) | `frontend/lib/channel-relay-association.ts`、`frontend/lib/recent-call-comparison.ts` |
| 时间桶对齐、悬停与调用明细 | [调用对比](/logic/call-comparison) | `frontend/lib/relay-compare-bucket.ts`、`frontend/components/monitor/latency-stability-lane.tsx`、`frontend/components/monitor/channel-relay-compare.tsx` |
| 跨站近期样本查询 | [调用对比](/logic/call-comparison) | `backend/internal/api/relay_stations.go`、`frontend/lib/queries.ts` |
| 风险、候选、自动调组与降级 | [自动调组](/logic/auto-group-adjustment) | `backend/internal/relay/risk.go`：`evaluateAccountRiskWithOptions`、`applyAutomaticAdjustments` |
| 自动优先级与召回 | [自动优先级](/logic/auto-priority) | `backend/internal/relay/risk.go`：`automaticPriorityTargetsWithRecall` |
| 运行参数、克隆、探测与测试 | [账号操作与测试](/logic/account-operations) | `backend/internal/relay/risk.go`、`backend/internal/relay/service.go` |
| 本地匹配、状态与采购 | [本地号池](/logic/local-account-lifecycle) | `backend/internal/storage/operations.go` |
| 用户注册风险与管理员保护 | [用户风险识别](/logic/user-risk) | `backend/internal/relay/service.go`：`registrationIPs`、`userRiskScore`、`DeleteUsers` |
| 同步顺序、任务重叠与保留 | [同步与数据处理](/logic/synchronization) | `backend/internal/scheduler/scheduler.go`、`backend/internal/storage/settings.go`、`backend/internal/relay/service.go` |
| 通知订阅、阈值、冷却、重试 | [通知规则](/logic/notifications-and-captcha) | `backend/internal/notify/dispatcher.go`、`backend/internal/notify/policy.go`、`backend/internal/notify/subscription.go` |
| CAPTCHA 与登录 | [验证码规则](/logic/notifications-and-captcha) | `backend/internal/channel/service.go`、`backend/internal/captcha` |
| 公开监控与最终失败合并 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/group_monitor.go` |
| 价格覆盖、独立生图与缓存 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/relay/model_pricing.go` |
| 官方状态与按天可用率 | [公开数据规则](/logic/public-monitor-and-pricing) | `backend/internal/api/public_service_status.go` |
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
