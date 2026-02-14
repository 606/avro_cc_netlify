import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// @ts-ignore
import script from "./scripts/sidebarResize.inline"

const SidebarResize: QuartzComponent = (_props: QuartzComponentProps) => {
  return null
}

SidebarResize.afterDOMLoaded = script

export default (() => SidebarResize) satisfies QuartzComponentConstructor
