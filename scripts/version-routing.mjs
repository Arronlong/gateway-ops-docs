export function normalizeBase(base) {
  const segments = String(base ?? "").split("/").filter(Boolean)
  return segments.length ? `/${segments.join("/")}/` : "/"
}

export function normalizeRoute(route) {
  let value = String(route ?? "/").split(/[?#]/, 1)[0].replace(/\\/g, "/")
  value = `/${value}`.replace(/\/{2,}/g, "/")
  value = value.replace(/\.(?:md|html?)$/i, "").replace(/\/index$/, "/")
  if (value.length > 1) value = value.replace(/\/+$/, "")
  return value || "/"
}

export function buildVersionHref({
  origin,
  rootBase,
  currentBase,
  pathname,
  search = "",
  hash = "",
  targetVersion,
  latestVersion,
  routes,
  fallbackRoute = "/start/overview",
}) {
  const normalizedRoot = normalizeBase(rootBase)
  const normalizedCurrent = normalizeBase(currentBase)
  const currentPath = String(pathname ?? "/")
  const currentRoot = normalizedCurrent.slice(0, -1)
  const relativePath = currentPath === currentRoot
    ? "/"
    : currentPath.startsWith(normalizedCurrent)
      ? currentPath.slice(normalizedCurrent.length - 1)
      : "/"
  const route = normalizeRoute(relativePath)
  const availableRoutes = new Set(routes.map(normalizeRoute))
  const keepRoute = availableRoutes.has(route)
  const nextRoute = keepRoute ? route : normalizeRoute(fallbackRoute)
  const prefix = `v${targetVersion}/`
  const routeSuffix = nextRoute === "/" ? "" : nextRoute.slice(1)
  const targetPath = `${normalizedRoot}${prefix}${routeSuffix}`
  const suffix = keepRoute ? `${search}${hash}` : ""

  return new URL(`${targetPath}${suffix}`, origin).href
}
