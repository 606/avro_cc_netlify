import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const DraftBanner: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const isDraft = fileData.frontmatter?.draft === true || fileData.frontmatter?.draft === "true"
  const isObsolete =
    fileData.frontmatter?.obsolete === true || fileData.frontmatter?.obsolete === "true"

  if (!isDraft && !isObsolete) return null

  return (
    <>
      {isDraft && (
        <div class="draft-banner">
          <p>📝 This page is a work in progress and may be incomplete.</p>
        </div>
      )}
      {isObsolete && (
        <div class="obsolete-banner">
          <p>⚠️ This content is obsolete and may no longer be accurate. Use at your own risk.</p>
        </div>
      )}
    </>
  )
}

DraftBanner.css = `
.draft-banner,
.obsolete-banner {
  padding: 0.8rem 1.2rem;
  margin: 1rem 0 0 0;
  border-radius: 5px;
  border: 1px solid var(--lightgray);
  border-left: 4px solid var(--warning, #eab308);
  background-color: rgba(234, 179, 8, 0.08);
}

.obsolete-banner {
  border-left-color: var(--danger, #dc2626);
  background-color: rgba(220, 38, 38, 0.08);
}

.draft-banner p,
.obsolete-banner p {
  margin: 0;
  color: var(--darkgray);
}
`

export default (() => DraftBanner) satisfies QuartzComponentConstructor
