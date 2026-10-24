<script setup lang="ts">
import { computed } from "vue"
import { useData } from "vitepress"
import VPFlyout from "vitepress/dist/client/theme-default/components/VPFlyout.vue"
import { buildVersionHref, normalizeRoute } from "../../../scripts/version-routing.mjs"

type VersionItem = { version: string; routes: string[] }

const props = defineProps<{
  currentVersion: string
  latestVersion: string
  rootBase: string
  currentBase: string
  origin: string
  fallbackRoute: string
  versions: VersionItem[]
}>()

const { page } = useData()
const linkOrigin = computed(() => typeof window === "undefined" ? props.origin : window.location.origin)
const items = computed(() => {
  const route = normalizeRoute(page.value.relativePath)
  const pathname = route === "/" ? props.currentBase : `${props.currentBase}${route.slice(1)}`
  const search = typeof window === "undefined" ? "" : window.location.search
  const hash = typeof window === "undefined" ? "" : window.location.hash

  return props.versions.map((version) => {
    const selected = version.version === props.currentVersion
    const latest = version.version === props.latestVersion
    const label = `v${version.version}${latest ? " · latest" : ""}${selected ? " · 当前" : ""}`
    return {
      text: label,
      link: buildVersionHref({
        origin: linkOrigin.value,
        rootBase: props.rootBase,
        currentBase: props.currentBase,
        pathname,
        search,
        hash,
        targetVersion: version.version,
        latestVersion: props.latestVersion,
        routes: version.routes,
        fallbackRoute: props.fallbackRoute,
      }),
      target: "_self",
      noIcon: true,
    }
  })
})
</script>

<template>
  <VPFlyout :button="`v${currentVersion}`" label="选择文档版本" :items="items" />
</template>
