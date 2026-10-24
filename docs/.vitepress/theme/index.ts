import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import VersionSwitcher from "./VersionSwitcher.vue"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VersionSwitcher", VersionSwitcher)
  },
} satisfies Theme
