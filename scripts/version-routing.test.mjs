import test from "node:test"
import assert from "node:assert/strict"
import { buildVersionHref, normalizeRoute } from "./version-routing.mjs"

const common = {
  origin: "https://docs.example.test",
  rootBase: "/gateway-ops-docs/",
  currentBase: "/gateway-ops-docs/v1.0.4/",
  pathname: "/gateway-ops-docs/v1.0.4/logic/metrics",
  latestVersion: "1.0.4",
  fallbackRoute: "/start/overview",
}

test("switching versions keeps the same available page and its query and hash", () => {
  const href = buildVersionHref({
    ...common,
    targetVersion: "1.0.3",
    routes: ["/start/overview", "/logic/metrics"],
    search: "?mode=recent",
    hash: "#latency",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.3/logic/metrics?mode=recent#latency")
})

test("switching to latest uses its explicit version URL", () => {
  const href = buildVersionHref({
    ...common,
    targetVersion: "1.0.4",
    routes: ["/start/overview", "/logic/metrics"],
    search: "",
    hash: "",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.4/logic/metrics")
})

test("a page missing from the target version falls back without stale query or hash", () => {
  const href = buildVersionHref({
    ...common,
    targetVersion: "1.0.3",
    routes: ["/start/overview", "/reference/changelog"],
    search: "?filter=failed",
    hash: "#new-section",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.3/start/overview")
})

test("an unmatched current base uses the target version fallback", () => {
  const href = buildVersionHref({
    ...common,
    pathname: "/unrelated/path",
    targetVersion: "1.0.3",
    routes: ["/start/overview"],
    search: "",
    hash: "",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.3/start/overview")
})

test("root and index routes are normalized consistently", () => {
  const href = buildVersionHref({
    ...common,
    pathname: "/gateway-ops-docs/v1.0.4/",
    targetVersion: "1.0.3",
    routes: ["/index", "/start/overview"],
    search: "",
    hash: "",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.3/")
})

test("the VitePress Markdown path matches the clean URL route", () => {
  assert.equal(normalizeRoute("guide/dashboard.md"), "/guide/dashboard")
})

test("a path outside the current version base falls back instead of being misparsed", () => {
  const href = buildVersionHref({
    ...common,
    pathname: "/gateway-ops-docs/v1.0.40/logic/metrics",
    targetVersion: "1.0.3",
    routes: ["/logic/metrics", "/start/overview"],
    search: "",
    hash: "",
  })

  assert.equal(href, "https://docs.example.test/gateway-ops-docs/v1.0.3/start/overview")
})
