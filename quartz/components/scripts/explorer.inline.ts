import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, SimpleSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

interface ParsedOptions {
  folderClickBehavior: "collapse" | "link"
  folderDefaultState: "collapsed" | "open"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: "sort" | "filter" | "map"[]
}

function countDescendants(node: FileTrieNode): number {
  if (!node.isFolder) return 1
  return node.children.reduce((sum, child) => sum + countDescendants(child), 0)
}

/**
 * Walk the trie to find the deepest folder matching the current slug path.
 * Returns the folder node and its ancestor chain (for breadcrumbs).
 * O(depth) — even for 20 levels this is just 20 iterations.
 */
function findCurrentFolder(
  trie: FileTrieNode,
  currentSlug: FullSlug,
): { folder: FileTrieNode; ancestors: FileTrieNode[] } {
  if (currentSlug === "index") {
    return { folder: trie, ancestors: [] }
  }

  const segments = currentSlug.split("/").filter(Boolean)
  // Remove trailing "index" — folder pages have slugs like "a/b/index"
  if (segments[segments.length - 1] === "index") {
    segments.pop()
  }

  let current = trie
  const ancestors: FileTrieNode[] = []

  for (const segment of segments) {
    const child = current.children.find((c) => c.slugSegment === segment && c.isFolder)
    if (!child) break // stop at deepest matching folder
    ancestors.push(current)
    current = child
  }

  // If we didn't move at all, we're at root
  if (current === trie) {
    return { folder: trie, ancestors: [] }
  }

  return { folder: current, ancestors }
}

function toggleExplorer(this: HTMLElement) {
  const nearestExplorer = this.closest(".explorer") as HTMLElement
  if (!nearestExplorer) return
  const explorerCollapsed = nearestExplorer.classList.toggle("collapsed")
  nearestExplorer.setAttribute(
    "aria-expanded",
    nearestExplorer.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )

  if (!explorerCollapsed) {
    document.documentElement.classList.add("mobile-no-scroll")
  } else {
    document.documentElement.classList.remove("mobile-no-scroll")
  }
}

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.textContent = node.displayName

  if (currentSlug === node.slug) {
    a.classList.add("active")
  }

  return li
}

/**
 * Create a flat folder item — NOT recursive.
 * Renders as a clickable link that navigates into the folder.
 */
function createFolderItem(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const li = document.createElement("li")
  li.classList.add("explorer-folder-item")

  const a = document.createElement("a")
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.className = "folder-entry"

  const nameSpan = document.createElement("span")
  nameSpan.className = "folder-entry-name"
  nameSpan.textContent = node.displayName
  a.appendChild(nameSpan)

  const count = countDescendants(node)
  const badge = document.createElement("span")
  badge.className = "note-count"
  badge.textContent = String(count)
  a.appendChild(badge)

  const chevron = document.createElement("span")
  chevron.className = "folder-entry-chevron"
  chevron.textContent = "\u203A" // single right-pointing angle quotation mark
  a.appendChild(chevron)

  li.appendChild(a)
  return li
}

const backArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`

/**
 * Create the breadcrumb header for drilled views.
 * Compact: shows `... > last 2 ancestors > current` for deep nesting.
 */
function createBreadcrumbHeader(
  currentSlug: FullSlug,
  currentFolder: FileTrieNode,
  ancestors: FileTrieNode[],
): HTMLLIElement {
  const headerLi = document.createElement("li")
  headerLi.className = "explorer-drilled-header"

  // Back arrow → parent folder
  const parent = ancestors[ancestors.length - 1]
  const backA = document.createElement("a")
  backA.href = resolveRelative(currentSlug, parent.slug)
  backA.dataset.for = parent.slug
  backA.className = "drilled-back"
  backA.innerHTML = backArrowSvg
  headerLi.appendChild(backA)

  // Breadcrumb path: skip trie root (ancestors[0]) — it has no meaningful name
  const crumbAncestors = ancestors.slice(1)
  const maxVisible = 2
  const showEllipsis = crumbAncestors.length > maxVisible

  if (showEllipsis) {
    // Ellipsis with dropdown showing all hidden ancestors
    const hiddenCrumbs = crumbAncestors.slice(0, -maxVisible)

    const wrapper = document.createElement("span")
    wrapper.className = "drilled-ellipsis-wrapper"

    const trigger = document.createElement("button")
    trigger.className = "drilled-ellipsis"
    trigger.type = "button"
    trigger.title = crumbAncestors.map((n) => n.displayName).join(" \u203A ")
    trigger.textContent = "\u2026"
    wrapper.appendChild(trigger)

    // Dropdown with all hidden ancestors
    const dropdown = document.createElement("ul")
    dropdown.className = "drilled-dropdown"

    // Root link (Home)
    const rootLi = document.createElement("li")
    const rootA = document.createElement("a")
    rootA.href = resolveRelative(currentSlug, "index" as FullSlug)
    rootA.dataset.for = "index"
    rootA.textContent = "Home"
    rootLi.appendChild(rootA)
    dropdown.appendChild(rootLi)

    for (const ancestor of hiddenCrumbs) {
      const li = document.createElement("li")
      const a = document.createElement("a")
      a.href = resolveRelative(currentSlug, ancestor.slug)
      a.dataset.for = ancestor.slug
      a.textContent = ancestor.displayName
      li.appendChild(a)
      dropdown.appendChild(li)
    }

    wrapper.appendChild(dropdown)
    headerLi.appendChild(wrapper)

    // Position and toggle dropdown on click
    trigger.addEventListener("click", (e) => {
      e.stopPropagation()
      const isOpen = dropdown.classList.toggle("open")
      if (isOpen) {
        const rect = trigger.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + 4}px`
        dropdown.style.left = `${rect.left}px`
      }
    })

    // Close on click outside
    const closeDropdown = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        dropdown.classList.remove("open")
      }
    }
    document.addEventListener("click", closeDropdown)
    window.addCleanup(() => document.removeEventListener("click", closeDropdown))

    // Close on Escape
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dropdown.classList.remove("open")
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    window.addCleanup(() => document.removeEventListener("keydown", closeOnEscape))

    const sep = document.createElement("span")
    sep.className = "drilled-sep"
    sep.textContent = "\u203A"
    headerLi.appendChild(sep)
  }

  // Show last N ancestors as clickable links
  const visibleCrumbs = showEllipsis ? crumbAncestors.slice(-maxVisible) : crumbAncestors
  for (const ancestor of visibleCrumbs) {
    const crumb = document.createElement("a")
    crumb.className = "drilled-crumb"
    crumb.href = resolveRelative(currentSlug, ancestor.slug)
    crumb.dataset.for = ancestor.slug
    crumb.textContent = ancestor.displayName
    headerLi.appendChild(crumb)

    const sep = document.createElement("span")
    sep.className = "drilled-sep"
    sep.textContent = "\u203A"
    headerLi.appendChild(sep)
  }

  // Current folder title (not clickable — you're already here)
  const titleSpan = document.createElement("span")
  titleSpan.className = "drilled-title"
  titleSpan.textContent = currentFolder.displayName
  headerLi.appendChild(titleSpan)

  return headerLi
}

async function setupExplorer(currentSlug: FullSlug) {
  const allExplorers = document.querySelectorAll("div.explorer") as NodeListOf<HTMLElement>

  for (const explorer of allExplorers) {
    const dataFns = JSON.parse(explorer.dataset.dataFns || "{}")
    const opts: ParsedOptions = {
      folderClickBehavior: (explorer.dataset.behavior || "collapse") as "collapse" | "link",
      folderDefaultState: (explorer.dataset.collapsed || "collapsed") as "collapsed" | "open",
      useSavedState: explorer.dataset.savestate === "true",
      order: dataFns.order || ["filter", "map", "sort"],
      sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
      filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
      mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
    }

    const data = await fetchData
    const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
    const trie = FileTrieNode.fromEntries(entries)

    // Apply functions in order
    for (const fn of opts.order) {
      switch (fn) {
        case "filter":
          if (opts.filterFn) trie.filter(opts.filterFn)
          break
        case "map":
          if (opts.mapFn) trie.map(opts.mapFn)
          break
        case "sort":
          if (opts.sortFn) trie.sort(opts.sortFn)
          break
      }
    }

    const explorerUl = explorer.querySelector(".explorer-ul")
    if (!explorerUl) continue

    // Lazy single-level rendering: find folder for current slug
    const { folder, ancestors } = findCurrentFolder(trie, currentSlug)
    const isDrilled = ancestors.length > 0

    const fragment = document.createDocumentFragment()

    // Breadcrumb header when drilled into a subfolder
    if (isDrilled) {
      explorerUl.classList.add("drilled")
      fragment.appendChild(createBreadcrumbHeader(currentSlug, folder, ancestors))
    }

    // Render only direct children — flat, no recursion
    for (const child of folder.children) {
      const node = child.isFolder
        ? createFolderItem(currentSlug, child)
        : createFileNode(currentSlug, child)
      fragment.appendChild(node)
    }

    explorerUl.insertBefore(fragment, explorerUl.firstChild)

    // Restore explorer scroll position
    const scrollTop = sessionStorage.getItem("explorerScrollTop")
    if (scrollTop) {
      explorerUl.scrollTop = parseInt(scrollTop)
    } else {
      const activeElement = explorerUl.querySelector(".active")
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth" })
      }
    }

    // Mobile explorer toggle handlers
    const explorerButtons = explorer.getElementsByClassName(
      "explorer-toggle",
    ) as HTMLCollectionOf<HTMLElement>
    for (const button of explorerButtons) {
      button.addEventListener("click", toggleExplorer)
      window.addCleanup(() => button.removeEventListener("click", toggleExplorer))
    }
  }
}

document.addEventListener("prenav", async () => {
  const explorer = document.querySelector(".explorer-ul")
  if (!explorer) return
  sessionStorage.setItem("explorerScrollTop", explorer.scrollTop.toString())
})

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupExplorer(currentSlug)

  // if mobile hamburger is visible, collapse by default
  for (const explorer of document.getElementsByClassName("explorer")) {
    const mobileExplorer = explorer.querySelector(".mobile-explorer")
    if (!mobileExplorer) return

    if (mobileExplorer.checkVisibility()) {
      explorer.classList.add("collapsed")
      explorer.setAttribute("aria-expanded", "false")
      document.documentElement.classList.remove("mobile-no-scroll")
    }

    mobileExplorer.classList.remove("hide-until-loaded")
  }
})

window.addEventListener("resize", function () {
  const explorer = document.querySelector(".explorer")
  if (explorer && !explorer.classList.contains("collapsed")) {
    document.documentElement.classList.add("mobile-no-scroll")
    return
  }
})
