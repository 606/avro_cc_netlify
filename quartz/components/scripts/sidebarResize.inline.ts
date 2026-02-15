document.addEventListener("nav", () => {
  const quartzBody = document.getElementById("quartz-body")
  if (!quartzBody) return

  // Only enable on desktop (grid layout with sidebar)
  const mql = window.matchMedia("(min-width: 1200px)")
  if (!mql.matches) return

  const leftSidebar = quartzBody.querySelector<HTMLElement>(".sidebar.left")
  if (!leftSidebar) return

  // Create drag handle
  let handle = document.querySelector<HTMLElement>(".sidebar-resize-handle")
  if (!handle) {
    handle = document.createElement("div")
    handle.className = "sidebar-resize-handle"
    document.body.appendChild(handle)
  }

  const STORAGE_KEY = "sidebar-width"
  const MIN_WIDTH = 180
  const MAX_WIDTH = 500

  // Restore saved width
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const w = parseInt(saved, 10)
    if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
      quartzBody.style.gridTemplateColumns = `${w}px 1fr minmax(220px, 380px)`
    }
  }

  // Position handle at right edge of sidebar
  function positionHandle() {
    if (!handle || !leftSidebar) return
    const rect = leftSidebar.getBoundingClientRect()
    handle.style.left = `${rect.right - 3}px`
  }

  positionHandle()
  window.addEventListener("resize", positionHandle)
  window.addCleanup(() => window.removeEventListener("resize", positionHandle))

  let dragging = false

  function onMouseDown(e: MouseEvent) {
    e.preventDefault()
    dragging = true
    handle!.classList.add("dragging")
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging || !quartzBody) return
    const pageRect = document.querySelector<HTMLElement>(".page")?.getBoundingClientRect()
    if (!pageRect) return

    let newWidth = e.clientX - pageRect.left
    newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))

    quartzBody.style.gridTemplateColumns = `${newWidth}px 1fr minmax(220px, 380px)`
    localStorage.setItem(STORAGE_KEY, String(newWidth))
    positionHandle()
  }

  function onMouseUp() {
    if (!dragging) return
    dragging = false
    handle!.classList.remove("dragging")
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  handle.addEventListener("mousedown", onMouseDown)
  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("mouseup", onMouseUp)

  window.addCleanup(() => {
    handle!.removeEventListener("mousedown", onMouseDown)
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  })

  // Also handle media query changes — disable on mobile/tablet
  function onMediaChange(e: MediaQueryListEvent) {
    if (!e.matches && handle) {
      handle.style.display = "none"
      if (quartzBody) quartzBody.style.gridTemplateColumns = ""
    } else if (handle) {
      handle.style.display = ""
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && quartzBody) {
        quartzBody.style.gridTemplateColumns = `${saved}px 1fr minmax(220px, 380px)`
      }
      positionHandle()
    }
  }

  mql.addEventListener("change", onMediaChange)
  window.addCleanup(() => mql.removeEventListener("change", onMediaChange))
})
