import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/relatedPages.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"

interface RelatedPagesOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: RelatedPagesOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<RelatedPagesOptions>) => {
  const options: RelatedPagesOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const RelatedPages: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const rawRelated = fileData.frontmatter?.related as string[] | undefined
    if (!rawRelated || rawRelated.length === 0) {
      if (options.hideWhenEmpty) return null
      return null
    }

    // Parse wikilinks: "[[slug]]" or "[[slug|alias]]" → "slug"
    const relatedSlugs = rawRelated
      .map((r: string) => {
        const match = r.match(/^\[\[(.+?)(?:\|.+?)?\]\]$/)
        return match ? match[1] : null
      })
      .filter((r): r is string => r !== null)

    if (relatedSlugs.length === 0) {
      if (options.hideWhenEmpty) return null
      return null
    }

    // Resolve slugs to actual files (exact match first, then last segment like Obsidian)
    const relatedFiles = relatedSlugs
      .map((relSlug) => {
        // Normalize: simplifySlug may include trailing slash for folder indexes
        const normalize = (s: string) => s.replace(/\/$/, "")
        // Prefer exact simplified slug match
        const exact = allFiles.find(
          (file) => normalize(simplifySlug(file.slug!)) === relSlug,
        )
        if (exact) return exact
        // Fallback: match by last path segment (e.g. "docker" → "infrastructure/docker")
        return allFiles.find((file) => {
          const simplified = normalize(simplifySlug(file.slug!))
          return simplified.split("/").pop() === relSlug
        })
      })
      .filter((f) => f !== undefined)

    if (options.hideWhenEmpty && relatedFiles.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "related-pages")}>
        <h3>Related</h3>
        <OverflowList>
          {relatedFiles.map((f) => (
            <li>
              <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                {f.frontmatter?.title}
              </a>
            </li>
          ))}
        </OverflowList>
      </div>
    )
  }

  RelatedPages.css = style
  RelatedPages.afterDOMLoaded = overflowListAfterDOMLoaded

  return RelatedPages
}) satisfies QuartzComponentConstructor
