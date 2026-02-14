document.addEventListener("nav", () => {
  const button = document.querySelector(".random-note") as HTMLButtonElement | null
  if (!button) return

  const handleClick = () => {
    const raw = button.getAttribute("data-random-slugs")
    if (!raw) return

    const slugs: string[] = JSON.parse(raw)
    if (slugs.length === 0) return

    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)]
    const url = new URL(randomSlug, window.location.origin + "/")
    window.spaNavigate(url)
  }

  button.addEventListener("click", handleClick)
  window.addCleanup(() => button.removeEventListener("click", handleClick))
})
