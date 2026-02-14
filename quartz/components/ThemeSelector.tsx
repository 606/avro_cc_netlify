// @ts-ignore
import themeSelectorScript from "./scripts/themeSelector.inline"
import styles from "./styles/themeSelector.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { themePresets } from "../util/theme"
import { classNames } from "../util/lang"

const ThemeSelector: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "theme-selector")}>
      <button class="theme-selector-toggle" aria-label="Change theme" type="button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="10.5" r="2.5" />
          <circle cx="8.5" cy="7.5" r="2.5" />
          <circle cx="6.5" cy="12.5" r="2.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </button>
      <ul class="theme-selector-dropdown">
        {themePresets.map((preset) => (
          <li>
            <button
              class="theme-preset-btn"
              data-theme-id={preset.id}
              type="button"
            >
              <span
                class="theme-preview"
                style={`background: linear-gradient(135deg, ${preset.lightMode.secondary} 50%, ${preset.darkMode.secondary} 50%);`}
              />
              {preset.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

ThemeSelector.beforeDOMLoaded = `
  const savedPreset = localStorage.getItem("theme-preset");
  if (savedPreset && savedPreset !== "default") {
    document.documentElement.setAttribute("data-theme", savedPreset);
  }
`
ThemeSelector.afterDOMLoaded = themeSelectorScript
ThemeSelector.css = styles

export default (() => ThemeSelector) satisfies QuartzComponentConstructor
