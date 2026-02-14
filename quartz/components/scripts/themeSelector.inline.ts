document.addEventListener("nav", () => {
  // Restore saved theme preset
  const savedPreset = localStorage.getItem("theme-preset") ?? "default"
  if (savedPreset !== "default") {
    document.documentElement.setAttribute("data-theme", savedPreset)
  } else {
    document.documentElement.removeAttribute("data-theme")
  }

  // Mark active preset button
  function markActive(presetId: string) {
    for (const btn of document.querySelectorAll<HTMLButtonElement>(".theme-preset-btn")) {
      btn.classList.toggle("active", btn.dataset.themeId === presetId)
    }
  }
  markActive(savedPreset)

  // Toggle dropdown
  for (const toggle of document.querySelectorAll<HTMLButtonElement>(".theme-selector-toggle")) {
    const dropdown = toggle.nextElementSibling as HTMLElement | null

    const onClick = (e: Event) => {
      e.stopPropagation()
      dropdown?.classList.toggle("open")
    }
    toggle.addEventListener("click", onClick)
    window.addCleanup(() => toggle.removeEventListener("click", onClick))
  }

  // Handle preset selection
  for (const btn of document.querySelectorAll<HTMLButtonElement>(".theme-preset-btn")) {
    const onClick = () => {
      const presetId = btn.dataset.themeId!
      if (presetId === "default") {
        document.documentElement.removeAttribute("data-theme")
      } else {
        document.documentElement.setAttribute("data-theme", presetId)
      }
      localStorage.setItem("theme-preset", presetId)
      markActive(presetId)

      // Close dropdown
      btn.closest(".theme-selector-dropdown")?.classList.remove("open")

      // Emit event for other components
      document.dispatchEvent(
        new CustomEvent("themechange", {
          detail: { preset: presetId },
        }),
      )
    }
    btn.addEventListener("click", onClick)
    window.addCleanup(() => btn.removeEventListener("click", onClick))
  }

  // Close dropdown on outside click
  const closeDropdowns = () => {
    for (const dd of document.querySelectorAll(".theme-selector-dropdown.open")) {
      dd.classList.remove("open")
    }
  }
  document.addEventListener("click", closeDropdowns)
  window.addCleanup(() => document.removeEventListener("click", closeDropdowns))
})
