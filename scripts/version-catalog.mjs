import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { extname, relative, resolve, sep } from "node:path"
import { normalizeRoute } from "./version-routing.mjs"

const stableVersion = /^\d+\.\d+\.\d+$/
const commitSHA = /^[0-9a-f]{40}$/i
const excludedVersionPaths = new Set(["docs/deploy/docs-site-pages.md"])

export function isExcludedVersionPath(path) {
  return excludedVersionPaths.has(path.replaceAll("\\", "/"))
}

function routeFromMarkdownPath(path) {
  const normalized = path.replaceAll("\\", "/")
  if (isExcludedVersionPath(normalized) || !normalized.startsWith("docs/") || !normalized.endsWith(".md")) return null
  const docPath = normalized.slice("docs/".length)
  if (docPath.startsWith("public/") || docPath.startsWith(".vitepress/") || docPath.split("/").some((part) => part.startsWith("."))) return null
  const withoutExtension = docPath.replace(/\.md$/i, "")
  return normalizeRoute(withoutExtension === "index" ? "/" : `/${withoutExtension}`)
}

export function routesFromMarkdownPaths(paths) {
  return [...new Set(paths.map(routeFromMarkdownPath).filter(Boolean))].sort()
}

export function scanMarkdownRoutes(docsRoot) {
  const files = []
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "public") continue
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (extname(path).toLowerCase() === ".md") files.push(`docs/${relative(docsRoot, path).split(sep).join("/")}`)
    }
  }
  walk(docsRoot)
  return routesFromMarkdownPaths(files)
}

export function validateVersionManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.versions) || !manifest.versions.length) {
    throw new Error("Version catalog must contain at least one version")
  }
  const seen = new Set()
  for (const entry of manifest.versions) {
    if (!stableVersion.test(entry.version)) throw new Error(`Invalid stable documentation version: ${entry.version}`)
    if (seen.has(entry.version)) throw new Error(`Duplicate documentation version: ${entry.version}`)
    seen.add(entry.version)
    if (entry.source !== "working-tree" && !commitSHA.test(entry.source)) {
      throw new Error(`Invalid documentation source for ${entry.version}`)
    }
  }
  if (!seen.has(manifest.latest)) throw new Error(`Latest version is absent from catalog: ${manifest.latest}`)
  if (!manifest.fallbackRoute || !manifest.fallbackRoute.startsWith("/")) {
    throw new Error("Version catalog fallbackRoute must be an absolute site route")
  }
  return manifest
}

export function resolveVersionCatalog(manifest, { repoRoot, currentDocsRoot }) {
  validateVersionManifest(manifest)
  const versions = manifest.versions.map((entry) => {
    const paths = entry.source === "working-tree"
      ? scanMarkdownRoutes(currentDocsRoot)
      : execFileSync("git", ["ls-tree", "-r", "--name-only", entry.source, "--", "docs"], {
          cwd: repoRoot,
          encoding: "utf8",
        }).trim().split(/\r?\n/).filter(Boolean)
    const routes = entry.source === "working-tree" ? paths : routesFromMarkdownPaths(paths)
    if (!routes.includes(normalizeRoute(manifest.fallbackRoute))) {
      throw new Error(`Version ${entry.version} is missing fallback route ${manifest.fallbackRoute}`)
    }
    return { version: entry.version, source: entry.source, routes }
  })
  return {
    latest: manifest.latest,
    fallbackRoute: normalizeRoute(manifest.fallbackRoute),
    versions,
  }
}
