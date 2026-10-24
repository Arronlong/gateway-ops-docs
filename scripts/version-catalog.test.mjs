import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { routesFromMarkdownPaths, scanMarkdownRoutes, validateVersionManifest } from "./version-catalog.mjs"

test("markdown paths become clean routes and ignore implementation and public assets", () => {
  assert.deepEqual(routesFromMarkdownPaths([
    "docs/index.md",
    "docs/guide/channels.md",
    "docs/guide/index.md",
    "docs/.vitepress/config.mts",
    "docs/public/README.md",
    "docs/deploy/docs-site-pages.md",
    "README.md",
  ]), ["/", "/guide", "/guide/channels"])
})

test("working-tree route scan excludes generated and public directories", () => {
  const root = mkdtempSync(join(tmpdir(), "gatewayops-doc-routes-"))
  try {
    mkdirSync(join(root, "guide"), { recursive: true })
    mkdirSync(join(root, "public"), { recursive: true })
    mkdirSync(join(root, ".vitepress"), { recursive: true })
    writeFileSync(join(root, "index.md"), "# Home")
    writeFileSync(join(root, "guide", "channels.md"), "# Channels")
    writeFileSync(join(root, "public", "ignored.md"), "# Ignored")
    writeFileSync(join(root, ".vitepress", "ignored.md"), "# Ignored")
    assert.deepEqual(scanMarkdownRoutes(root), ["/", "/guide/channels"])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("version manifest rejects duplicate versions and missing latest version", () => {
  const base = { latest: "1.0.1", fallbackRoute: "/start/overview" }
  assert.throws(() => validateVersionManifest({
    ...base,
    versions: [
      { version: "1.0.1", source: "working-tree" },
      { version: "1.0.1", source: "working-tree" },
    ],
  }), /Duplicate documentation version/)
  assert.throws(() => validateVersionManifest({
    ...base,
    latest: "1.0.2",
    versions: [{ version: "1.0.1", source: "working-tree" }],
  }), /Latest version is absent/)
})
