import { defineConfig } from "vitepress"
import release from "../release.json"

export default defineConfig({
  lang: "zh-CN",
  title: "GatewayOps 文档",
  description: "GatewayOps 产品使用、部署、业务规则与架构说明",
  base: process.env.DOCS_BASE ?? "/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "开始使用", link: "/start/overview" },
      { text: "使用指南", link: "/guide/dashboard" },
      { text: "业务规则", link: "/logic/index" },
      { text: "架构", link: "/architecture/overview" },
      { text: `v${release.app_version}`, link: "/reference/versions" },
    ],
    sidebar: [
      {
        text: "了解 GatewayOps",
        items: [
          { text: "项目概览", link: "/start/overview" },
          { text: "快速开始", link: "/start/quick-start" },
        ],
      },
      {
        text: "安装与部署",
        items: [
          { text: "Docker Compose 部署", link: "/deploy/docker-compose" },
          { text: "配置参考", link: "/deploy/configuration" },
          { text: "安全、升级与备份", link: "/deploy/security-backup-upgrade" },
        ],
      },
      {
        text: "产品使用指南",
        items: [
          { text: "运营总览", link: "/guide/dashboard" },
          { text: "渠道管理", link: "/guide/channels" },
          { text: "中转站管理", link: "/guide/relay-stations" },
          { text: "成本管理", link: "/guide/operations" },
          { text: "本地号池", link: "/guide/local-pool" },
          { text: "通知与验证码", link: "/guide/notifications" },
          { text: "系统设置", link: "/guide/system-settings" },
          { text: "公开页面", link: "/guide/public-pages" },
        ],
      },
      {
        text: "业务规则与指标",
        items: [
          { text: "业务规则总览", link: "/logic/index" },
          { text: "指标口径", link: "/logic/metrics" },
          { text: "渠道余额与调用记录", link: "/logic/channel-consumption" },
          { text: "成本与倍率", link: "/logic/cost-accounting" },
          { text: "延迟与稳定性", link: "/logic/latency-and-stability" },
          { text: "缓存指标与健康评分", link: "/logic/cache-and-health-score" },
          { text: "渠道与中转站调用对比", link: "/logic/call-comparison" },
          { text: "New API 中转站", link: "/logic/newapi-relay" },
          { text: "鹈鹕测智与作品历史", link: "/logic/pelican-testing" },
          { text: "风险与调度概览", link: "/logic/risk-and-scheduling" },
          { text: "自动调组", link: "/logic/auto-group-adjustment" },
          { text: "自动优先级与召回", link: "/logic/auto-priority" },
          { text: "账号操作与测试", link: "/logic/account-operations" },
          { text: "本地号池与采购账本", link: "/logic/local-account-lifecycle" },
          { text: "用户风险识别", link: "/logic/user-risk" },
          { text: "同步与数据处理", link: "/logic/synchronization" },
          { text: "通知与验证码规则", link: "/logic/notifications-and-captcha" },
          { text: "公开页面的数据规则", link: "/logic/public-monitor-and-pricing" },
          { text: "访问与显示策略", link: "/logic/security-and-access" },
        ],
      },
      {
        text: "架构与开发",
        items: [
          { text: "系统架构", link: "/architecture/overview" },
          { text: "主要数据流", link: "/architecture/data-flows" },
          { text: "本地开发", link: "/development/local-development" },
          { text: "规则覆盖与维护", link: "/development/documentation-maintenance" },
        ],
      },
      {
        text: "参考与排障",
        items: [
          { text: "配置项", link: "/reference/configuration" },
          { text: "版本与更新", link: "/reference/versions" },
          { text: "产品更新记录", link: "/reference/changelog" },
          { text: "常见问题", link: "/reference/troubleshooting" },
        ],
      },
    ],
    search: { provider: "local" },
    socialLinks: [
      { icon: "github", link: "https://github.com/Arronlong/gateway-ops" },
    ],
    editLink: {
      pattern: "https://github.com/Arronlong/gateway-ops-docs/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    footer: {
      message: `适用 GatewayOps v${release.app_version} · 文档修订 ${process.env.DOCS_REVISION?.slice(0, 12) ?? "local"}`,
      copyright: "GatewayOps 采用 GNU AGPL v3.0 发布。",
    },
  },
})
