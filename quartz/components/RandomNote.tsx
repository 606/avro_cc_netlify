// @ts-ignore
import script from "./scripts/randomNote.inline"
import styles from "./styles/randomNote.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const RandomNote: QuartzComponent = ({ displayClass, allFiles }: QuartzComponentProps) => {
  const slugs = allFiles
    .filter((f) => f.slug && !f.slug.startsWith("tags/"))
    .map((f) => f.slug!)

  return (
    <button
      class={classNames(displayClass, "random-note")}
      aria-label="Random note"
      data-random-slugs={JSON.stringify(slugs)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64px"
        height="64px"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <title>Random note</title>
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    </button>
  )
}

RandomNote.afterDOMLoaded = script
RandomNote.css = styles

export default (() => RandomNote) satisfies QuartzComponentConstructor
