# 业务规则总览

这里解释 GatewayOps 页面数字从哪里来、配置何时生效，以及系统在什么条件下修改远端数据。先按问题定位规则，再结合对应使用指南操作。

这些说明已同步至 GatewayOps `v1.0.4` 标签提交 `f6aa3ff`；变化见 [产品更新记录](/reference/changelog)。部署实例可能使用不同提交；请先在系统设置查看版本、提交号和构建时间，再核对 [版本与更新](/reference/versions)。

## 指标与成本

| 你想了解什么 | 规则说明 |
| --- | --- |
| 时间范围、余额、请求数、用户扣费、空值的含义 | [指标口径](/logic/metrics) |
| 余额变化如何推算消耗、多账号失败如何汇总 | [渠道余额与调用记录](/logic/channel-consumption) |
| 现金净额、实际成本、成本倍率来源、覆盖优先级 | [成本与倍率](/logic/cost-accounting) |
| 首字时间、P50 / P95、输出速度、时间稳定性评分 | [延迟与稳定性](/logic/latency-and-stability) |
| 缓存命中、重试感知成功率、统计窗口和四项综合评分 | [缓存指标与健康评分](/logic/cache-and-health-score) |
| 渠道、号池与分组作品、全局方案和单次参数 | [鹈鹕测智与作品历史](/logic/pelican-testing) |
| 渠道与中转站账号关联、近期调用匹配、时间桶对齐及明细 | [渠道与中转站调用对比](/logic/call-comparison) |
| New API 中转站凭据、同步映射、管理能力及限制 | [New API 中转站](/logic/newapi-relay) |

## 策略与处理流程

| 你想了解什么 | 规则说明 |
| --- | --- |
| 账号为何被判定亏损、无利润或成本未知 | [风险与调度概览](/logic/risk-and-scheduling) |
| 自动调组选择哪个组、何时关闭调度、哪些账号跳过 | [自动调组](/logic/auto-group-adjustment) |
| OAuth / API Key 优先级、延迟排序、长时间未用账号召回 | [自动优先级与召回](/logic/auto-priority) |
| 并发、重试、克隆、真实请求测试与倍率探测 | [账号操作与测试](/logic/account-operations) |
| 本地账号如何关联、状态如何变化、采购如何入账 | [本地号池与采购账本](/logic/local-account-lifecycle) |
| 注册 IP、注册突增、邮箱模式如何形成用户风险分 | [用户风险识别](/logic/user-risk) |
| 定时任务、同步顺序、缓存、数据保留与部分失败 | [同步与数据处理](/logic/synchronization) |
| 自动任务状态、耗时、执行日志、Token 刷新记录与中断 | [定时任务执行历史](/logic/task-execution-history) |
| 订阅过滤、倍率阈值、冷却、重试与验证码 | [通知与验证码规则](/logic/notifications-and-captcha) |
| 公开监控状态、成功率、模型价格与官方服务状态 | [公开页面的数据规则](/logic/public-monitor-and-pricing) |
| 页面隐藏、后台认证、凭据密钥和 iframe 白名单 | [访问与显示策略](/logic/security-and-access) |

## 阅读时先确认这几件事

1. **统计对象：** 渠道余额、账号调用成本、用户扣费和现金账本属于不同来源。
2. **时间：** 当前状态、近期最多 60 条样本、所选窗口和全部历史可能同时出现在一页。
3. **完整性：** 未知、失败、旧缓存和没有记录，均不等于数值为零。
4. **副作用：** 自动调组、优先级、账号批量操作会写远端；页面刷新通常只是重新查询。

配置默认值及生效方式见 [配置项](/reference/configuration)。文档与实现的对应关系见 [规则覆盖与维护](/development/documentation-maintenance)。
