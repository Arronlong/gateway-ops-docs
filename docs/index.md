# GatewayOps 文档

GatewayOps 是面向 NewAPI / Sub2API 生态的自托管运营管理平台。本网站说明如何部署和使用 GatewayOps，并解释页面指标、业务规则与系统架构。

如果你是第一次使用，请从 [项目概览](/start/overview) 和 [快速开始](/start/quick-start) 入手。已经在运行 GatewayOps 的用户可以直接查阅 [产品使用指南](/guide/dashboard) 或 [业务规则与指标](/logic/index)。

![GatewayOps 运营总览](/images/dashboard.png)

## 文档导航

| 你要做什么 | 从这里开始 |
| --- | --- |
| 了解 GatewayOps 能做什么 | [项目概览](/start/overview) |
| 启动一套 GatewayOps | [快速开始](/start/quick-start) |
| 在服务器上部署和升级 | [Docker Compose 部署](/deploy/docker-compose) |
| 学会使用某个页面 | [产品使用指南](/guide/dashboard) |
| 查找指标、配置和处理逻辑 | [业务规则总览](/logic/index) |
| 查清数字的计算口径 | [指标口径](/logic/metrics) |
| 对照渠道与中转站调用 | [渠道与中转站调用对比](/logic/call-comparison) |
| 查看产品变更与升级影响 | [产品更新记录](/reference/changelog) |
| 理解成本和倍率的关系 | [成本与倍率](/logic/cost-accounting) |
| 理解账号风险和调度建议 | [风险与调度概览](/logic/risk-and-scheduling) |
| 查看文档覆盖与维护来源 | [规则覆盖与维护](/development/documentation-maintenance) |
| 了解技术组成与数据流 | [系统架构](/architecture/overview) |
| 排查部署或数据问题 | [常见问题](/reference/troubleshooting) |

## 文档范围

本文档对照 GatewayOps `v1.0.1` 源码与主仓库提交 `e668765` 整理，变更来源见 [产品更新记录](/reference/changelog)。导航版本表示文档适用范围，实际发布版本以 GitHub Release 为准。不同版本的功能可能略有差异；升级前请同时查看对应版本的发布说明。所有示例均为虚构配置，不代表真实环境。
