import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { execFileSync, spawnSync } from "node:child_process"
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { buildVersionHref, normalizeBase, normalizeRoute } from "./version-routing.mjs"
import { isExcludedVersionPath, resolveVersionCatalog } from "./version-catalog.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const docsRoot = resolve(root, "docs")
const manifest = JSON.parse(readFileSync(resolve(docsRoot, "versions.json"), "utf8"))
const release = JSON.parse(readFileSync(resolve(docsRoot, "release.json"), "utf8"))
const rootBase = normalizeBase(process.env.DOCS_BASE ?? "/")
const origin = process.env.DOCS_ORIGIN ?? "http://127.0.0.1:5173"
const revision = process.env.DOCS_REVISION ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim()
const catalog = resolveVersionCatalog(manifest, { repoRoot: root, currentDocsRoot: docsRoot })
const cli = resolve(root, "node_modules/vitepress/bin/vitepress.js")
const tempRoot = mkdtempSync(join(root, ".versioned-docs-build-"))
const stagedRoot = resolve(tempRoot, "site")
const outputRoot = resolve(tempRoot, "outputs")
const helperFiles = ["version-routing.mjs", "version-catalog.mjs"]

if (manifest.latest !== release.app_version) {
  throw new Error(`Latest documentation version ${manifest.latest} does not match release.json ${release.app_version}`)
}

function isWithin(parent, candidate) {
  const path = relative(parent, candidate)
  return path === "" || (!isAbsolute(path) && !path.startsWith(`..${sep}`) && path !== "..")
}

function materializeGitDocs(entry, target) {
  mkdirSync(target, { recursive: true })
  const paths = execFileSync("git", ["ls-tree", "-r", "--name-only", entry.source, "--", "docs"], {
    cwd: root,
    encoding: "utf8",
  }).trim().split(/\r?\n/).filter(Boolean)
  for (const gitPath of paths) {
    if (gitPath === "docs/versions.json" || gitPath.startsWith("docs/.vitepress/") || isExcludedVersionPath(gitPath)) continue
    const relativePath = gitPath.slice("docs/".length)
    const destination = resolve(target, relativePath)
    if (!isWithin(target, destination)) throw new Error(`Unsafe documentation path in ${entry.version}: ${gitPath}`)
    mkdirSync(dirname(destination), { recursive: true })
    const contents = execFileSync("git", ["show", `${entry.source}:${gitPath}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 })
    writeFileSync(destination, contents)
  }
}

function prepareVersionDocs(entry) {
  if (entry.source === "working-tree") return docsRoot
  const versionRoot = resolve(tempRoot, `v${entry.version}`)
  const versionDocs = resolve(versionRoot, "docs")
  materializeGitDocs(entry, versionDocs)
  cpSync(resolve(docsRoot, ".vitepress"), resolve(versionDocs, ".vitepress"), {
    recursive: true,
    filter(path) {
      const rel = relative(resolve(docsRoot, ".vitepress"), path).replaceAll("\\", "/")
      return rel === "" || (rel !== "cache" && !rel.startsWith("cache/") && rel !== "dist" && !rel.startsWith("dist/"))
    },
  })
  writeFileSync(resolve(versionDocs, "versions.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8")
  const scriptsRoot = resolve(versionRoot, "scripts")
  mkdirSync(scriptsRoot, { recursive: true })
  for (const file of helperFiles) cpSync(resolve(root, "scripts", file), resolve(scriptsRoot, file))
  return versionDocs
}

function buildSite({ docs, version, base, output, sourceRef, historical }) {
  mkdirSync(dirname(output), { recursive: true })
  const env = {
    ...process.env,
    DOCS_BASE: base,
    DOCS_ROOT_BASE: rootBase,
    DOCS_VERSION: version,
    DOCS_CURRENT_ROOT: docsRoot,
    DOCS_REPOSITORY_ROOT: root,
    DOCS_REVISION: revision,
    DOCS_SOURCE_REF: sourceRef,
    DOCS_HISTORICAL: historical ? "1" : "0",
  }
  const build = spawnSync(process.execPath, [cli, "build", docs, "--outDir", output], {
    cwd: root,
    env,
    stdio: "inherit",
  })
  if (build.error) throw build.error
  if (build.status !== 0) throw new Error(`VitePress build failed for ${version} (${base}) with status ${build.status}`)
  verifyOutputLinks(output, base, rootBase, origin, version, catalog)
  verifyVersionSelector(output, base, rootBase, origin, version, catalog)
  const check = spawnSync(process.execPath, [resolve(root, "scripts/check-docs.mjs")], {
    cwd: root,
    env: { ...env, DOCS_ROOT: docs, DOCS_DIST: output },
    stdio: "inherit",
  })
  if (check.error) throw check.error
  if (check.status !== 0) throw new Error(`Documentation validation failed for ${version} (${base})`)
}

function walkHtml(directory) {
  const htmlFiles = []
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name)
    if (item.isDirectory()) htmlFiles.push(...walkHtml(path))
    else if (extname(item.name).toLowerCase() === ".html") htmlFiles.push(path)
  }
  return htmlFiles
}

function routeFromOutputPage(output, htmlPath) {
  const page = relative(output, htmlPath).split(sep).join("/")
  return normalizeRoute(page === "index.html" ? "/" : `/${page.replace(/\.html$/i, "")}`)
}

function selectorLinks(route, currentBase, siteBase, origin, catalog) {
  const pathname = route === "/" ? currentBase : `${currentBase}${route.slice(1)}`
  return catalog.versions.map((target) => buildVersionHref({
    origin,
    rootBase: siteBase,
    currentBase,
    pathname,
    targetVersion: target.version,
    latestVersion: catalog.latest,
    routes: target.routes,
    fallbackRoute: catalog.fallbackRoute,
  }))
}

function verifyOutputLinks(output, base, siteBase, origin, currentVersion, catalog) {
  const localOrigin = new URL(origin).origin
  const currentBase = currentVersion === catalog.latest && base === siteBase
    ? siteBase
    : normalizeBase(`${siteBase}v${currentVersion}`)
  for (const htmlPath of walkHtml(output)) {
    const page = relative(output, htmlPath).split(sep).join("/")
    const pageUrl = new URL(`${base}${page}`, localOrigin)
    const html = readFileSync(htmlPath, "utf8")
    const allowedSelectorLinks = new Set(selectorLinks(
      routeFromOutputPage(output, htmlPath),
      currentBase,
      siteBase,
      origin,
      catalog,
    ))
    for (const match of html.matchAll(/\b(?:href|src|poster)=(["'])(.*?)\1/gi)) {
      const target = match[2].replaceAll("&amp;", "&")
      if (!target) continue
      const resolved = new URL(target, pageUrl)
      if (resolved.origin !== localOrigin) continue
      if (resolved.pathname.startsWith(base) || (base !== "/" && resolved.pathname === base.slice(0, -1))) continue
      if (allowedSelectorLinks.has(resolved.href)) continue
      throw new Error(`Internal link escapes documentation base ${base}: ${relative(output, htmlPath)} -> ${target}`)
    }
  }
}

function verifyVersionSelector(output, currentBase, siteBase, origin, currentVersion, versionCatalog) {
  for (const htmlPath of walkHtml(output)) {
    if (relative(output, htmlPath).split(sep).join("/") === "404.html") continue
    const html = readFileSync(htmlPath, "utf8")
    const route = routeFromOutputPage(output, htmlPath)
    const expected = selectorLinks(route, currentBase, siteBase, origin, versionCatalog)
    for (const href of expected) {
      if (!html.includes(`href="${href}"`)) {
        throw new Error(`Version selector link is missing from ${relative(output, htmlPath)}: ${href}`)
      }
    }
    if (!html.includes(`v${currentVersion}`)) {
      throw new Error(`Current version label is missing from ${relative(output, htmlPath)}: ${currentVersion}`)
    }
  }
}

try {
  mkdirSync(outputRoot, { recursive: true })
  const latestEntry = catalog.versions.find(({ version }) => version === catalog.latest)
  const latestDocs = prepareVersionDocs(latestEntry)
  const latestSourceRef = latestEntry.source === "working-tree" ? revision : latestEntry.source

  buildSite({
    docs: latestDocs,
    version: catalog.latest,
    base: rootBase,
    output: resolve(outputRoot, "root"),
    sourceRef: latestSourceRef,
    historical: false,
  })

  for (const entry of catalog.versions) {
    const docs = prepareVersionDocs(entry)
    const base = normalizeBase(`${rootBase}v${entry.version}`)
    const sourceRef = entry.source === "working-tree" ? revision : entry.source
    buildSite({
      docs,
      version: entry.version,
      base,
      output: resolve(outputRoot, `v${entry.version}`),
      sourceRef,
      historical: entry.source !== "working-tree",
    })
  }

  const finalDist = resolve(docsRoot, ".vitepress/dist")
  if (!isWithin(docsRoot, finalDist) || finalDist !== resolve(docsRoot, ".vitepress", "dist")) {
    throw new Error(`Unexpected output directory: ${finalDist}`)
  }
  rmSync(stagedRoot, { recursive: true, force: true })
  cpSync(resolve(outputRoot, "root"), stagedRoot, { recursive: true })
  for (const entry of catalog.versions) {
    cpSync(resolve(outputRoot, `v${entry.version}`), resolve(stagedRoot, `v${entry.version}`), { recursive: true })
  }
  rmSync(finalDist, { recursive: true, force: true })
  cpSync(stagedRoot, finalDist, { recursive: true })
  console.log(`Built root alias and ${catalog.versions.length} versioned documentation sites.`)
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}
