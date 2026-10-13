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
      { text: "业务规则", link: "/logic/metrics" },
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
          { text: "发布文档站", link: "/deploy/docs-site-pages" },
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
          { text: "指标口径", link: "/logic/metrics" },
          { text: "成本与倍率", link: "/logic/cost-accounting" },
          { text: "风险与自动调度", link: "/logic/risk-and-scheduling" },
          { text: "同步与数据处理", link: "/logic/synchronization" },
        ],
      },
      {
        text: "架构与开发",
        items: [
          { text: "系统架构", link: "/architecture/overview" },
          { text: "主要数据流", link: "/architecture/data-flows" },
          { text: "本地开发", link: "/development/local-development" },
        ],
      },
      {
        text: "参考与排障",
        items: [
          { text: "配置项", link: "/reference/configuration" },
          { text: "版本与更新", link: "/reference/versions" },
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

