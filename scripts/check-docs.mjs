import { readFileSync, readdirSync, existsSync } from "node:fs"
import { resolve, relative, dirname, extname, posix } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const docs = resolve(root, "docs")
const decoder = new TextDecoder("utf-8", { fatal: true })
const errors = []
const pages = new Map()
let links = 0
let images = 0
let tables = 0

// 严格检查编码；替换字符和连续问号通常意味着内容写入损坏。
function readText(path) {
  const text = decoder.decode(readFileSync(path))
  if (/\?{3,}|\uFFFD/.test(text)) errors.push(`Invalid characters: ${relative(root, path)}`)
  return text
}

function walk(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "public") continue
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(path))
    else if (extname(path) === ".md") files.push(path)
  }
  return files
}

const files = walk(docs)
for (const path of files) {
  const route = "/" + relative(docs, path).replaceAll("\\", "/").replace(/\.md$/, "")
  const page = { path, text: readText(path), route }
  pages.set(route, page)
  if (route.endsWith("/index")) pages.set(route.slice(0, -5), page)
  if (route === "/index") pages.set("/", page)
}

function checkTarget(target, source, route, image = false) {
  target = target.trim().replace(/^<|>$/g, "").replace(/\s+".*"$/, "")
  if (/^(?:[a-z]+:|\/\/)/i.test(target)) return
  const [rawPath, rawAnchor] = target.split("#", 2)
  const pathname = decodeURIComponent(rawPath.split("?", 1)[0])
  const destination = pathname
    ? posix.normalize(pathname.startsWith("/") ? pathname : posix.join(posix.dirname(route), pathname))
    : route
  const clean = destination.replace(/\.md$|\.html$/, "")
  const page = pages.get(clean) ?? pages.get(clean + "/")
  if (image) images++
  else links++
  if (page && !image) {
    if (rawAnchor) {
      const html = resolve(docs, ".vitepress/dist", relative(docs, page.path).replace(/\.md$/, ".html"))
      if (!existsSync(html)) errors.push(`Build required for anchor: ${source} -> ${target}`)
      else {
        const anchor = decodeURIComponent(rawAnchor)
        const ids = [...readText(html).matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
        if (!ids.includes(anchor)) errors.push(`Missing anchor: ${source} -> ${target}`)
      }
    }
    return
  }
  const asset = resolve(docs, "public", "." + destination)
  if (!existsSync(asset)) errors.push(`Missing target: ${source} -> ${target}`)
}

// 检查正文链接、图片及表格；代码块不属于站内导航。
for (const { path, route, text } of new Set(pages.values())) {
  const source = relative(root, path)
  if (!/^# .*[\u4e00-\u9fff]/m.test(text)) errors.push(`Missing Chinese heading: ${source}`)
  const body = text.replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, "")
  for (const match of body.matchAll(/(!?)\[[^\]]*\]\(([^)]+)\)/g)) {
    checkTarget(match[2], source, route, match[1] === "!")
  }
  let columns = null
  for (const line of body.split("\n")) {
    if (!line.startsWith("|")) {
      columns = null
      continue
    }
    const width = line.split(/(?<!\\)\|/).length - 2
    if (columns === null) tables++
    else if (width !== columns) errors.push(`Inconsistent table: ${source}: ${line}`)
    columns = width
  }
}

const configPath = resolve(docs, ".vitepress/config.mts")
const config = readText(configPath)
const navigation = new Set()
for (const match of config.matchAll(/\blink:\s*"([^"]+)"/g)) {
  checkTarget(match[1], "docs/.vitepress/config.mts", "/index")
  navigation.add(match[1])
}
for (const page of new Set(pages.values())) {
  if (page.route !== "/index" && !navigation.has(page.route)) {
    errors.push(`Missing navigation entry: ${page.route}`)
  }
}
readText(resolve(docs, "release.json"))
readText(fileURLToPath(import.meta.url))

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log(`\u6587\u6863\u68c0\u67e5\u901a\u8fc7\uff1a${files.length} \u4e2a\u9875\u9762\uff0c${links} \u4e2a\u94fe\u63a5\uff0c${images} \u5f20\u56fe\u7247\uff0c${tables} \u4e2a\u8868\u683c\u3002`)
