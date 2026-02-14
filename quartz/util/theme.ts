export interface ColorScheme {
  light: string
  lightgray: string
  gray: string
  darkgray: string
  dark: string
  secondary: string
  tertiary: string
  highlight: string
  textHighlight: string
}

interface Colors {
  lightMode: ColorScheme
  darkMode: ColorScheme
}

export type FontSpecification =
  | string
  | {
      name: string
      weights?: number[]
      includeItalic?: boolean
    }

export interface Theme {
  typography: {
    title?: FontSpecification
    header: FontSpecification
    body: FontSpecification
    code: FontSpecification
  }
  cdnCaching: boolean
  colors: Colors
  fontOrigin: "googleFonts" | "local"
}

export type ThemeKey = keyof Colors

const DEFAULT_SANS_SERIF =
  'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
const DEFAULT_MONO = "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace"

export function getFontSpecificationName(spec: FontSpecification): string {
  if (typeof spec === "string") {
    return spec
  }

  return spec.name
}

function formatFontSpecification(
  type: "title" | "header" | "body" | "code",
  spec: FontSpecification,
) {
  if (typeof spec === "string") {
    spec = { name: spec }
  }

  const defaultIncludeWeights = type === "header" ? [400, 700] : [400, 600]
  const defaultIncludeItalic = type === "body"
  const weights = spec.weights ?? defaultIncludeWeights
  const italic = spec.includeItalic ?? defaultIncludeItalic

  const features: string[] = []
  if (italic) {
    features.push("ital")
  }

  if (weights.length > 1) {
    const weightSpec = italic
      ? weights
          .flatMap((w) => [`0,${w}`, `1,${w}`])
          .sort()
          .join(";")
      : weights.join(";")

    features.push(`wght@${weightSpec}`)
  }

  if (features.length > 0) {
    return `${spec.name}:${features.join(",")}`
  }

  return spec.name
}

export function googleFontHref(theme: Theme) {
  const { header, body, code } = theme.typography
  const headerFont = formatFontSpecification("header", header)
  const bodyFont = formatFontSpecification("body", body)
  const codeFont = formatFontSpecification("code", code)

  return `https://fonts.googleapis.com/css2?family=${headerFont}&family=${bodyFont}&family=${codeFont}&display=swap`
}

export function googleFontSubsetHref(theme: Theme, text: string) {
  const title = theme.typography.title || theme.typography.header
  const titleFont = formatFontSpecification("title", title)

  return `https://fonts.googleapis.com/css2?family=${titleFont}&text=${encodeURIComponent(text)}&display=swap`
}

export interface GoogleFontFile {
  url: string
  filename: string
  extension: string
}

const fontMimeMap: Record<string, string> = {
  truetype: "ttf",
  woff: "woff",
  woff2: "woff2",
  opentype: "otf",
}

export async function processGoogleFonts(
  stylesheet: string,
  baseUrl: string,
): Promise<{
  processedStylesheet: string
  fontFiles: GoogleFontFile[]
}> {
  const fontSourceRegex =
    /url\((https:\/\/fonts.gstatic.com\/.+(?:\/|(?:kit=))(.+?)[.&].+?)\)\sformat\('(\w+?)'\);/g
  const fontFiles: GoogleFontFile[] = []
  let processedStylesheet = stylesheet

  let match
  while ((match = fontSourceRegex.exec(stylesheet)) !== null) {
    const url = match[1]
    const filename = match[2]
    const extension = fontMimeMap[match[3].toLowerCase()]
    const staticUrl = `https://${baseUrl}/static/fonts/${filename}.${extension}`

    processedStylesheet = processedStylesheet.replace(url, staticUrl)
    fontFiles.push({ url, filename, extension })
  }

  return { processedStylesheet, fontFiles }
}

export interface ThemePreset {
  id: string
  name: string
  lightMode: ColorScheme
  darkMode: ColorScheme
}

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    lightMode: {
      light: "#faf8f8",
      lightgray: "#e5e5e5",
      gray: "#b8b8b8",
      darkgray: "#4e4e4e",
      dark: "#2b2b2b",
      secondary: "#284b63",
      tertiary: "#84a59d",
      highlight: "rgba(143, 159, 169, 0.15)",
      textHighlight: "#fff23688",
    },
    darkMode: {
      light: "#161618",
      lightgray: "#393639",
      gray: "#646464",
      darkgray: "#d4d4d4",
      dark: "#ebebec",
      secondary: "#7b97aa",
      tertiary: "#84a59d",
      highlight: "rgba(143, 159, 169, 0.15)",
      textHighlight: "#b3aa0288",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    lightMode: {
      light: "#eff1f5",
      lightgray: "#ccd0da",
      gray: "#9ca0b0",
      darkgray: "#4c4f69",
      dark: "#4c4f69",
      secondary: "#1e66f5",
      tertiary: "#179299",
      highlight: "rgba(30, 102, 245, 0.15)",
      textHighlight: "#df8e1d88",
    },
    darkMode: {
      light: "#1e1e2e",
      lightgray: "#313244",
      gray: "#6c7086",
      darkgray: "#cdd6f4",
      dark: "#cdd6f4",
      secondary: "#89b4fa",
      tertiary: "#94e2d5",
      highlight: "rgba(137, 180, 250, 0.15)",
      textHighlight: "#f9e2af88",
    },
  },
  {
    id: "nord",
    name: "Nord",
    lightMode: {
      light: "#eceff4",
      lightgray: "#d8dee9",
      gray: "#81a1c1",
      darkgray: "#3b4252",
      dark: "#2e3440",
      secondary: "#5e81ac",
      tertiary: "#88c0d0",
      highlight: "rgba(94, 129, 172, 0.15)",
      textHighlight: "#ebcb8b88",
    },
    darkMode: {
      light: "#2e3440",
      lightgray: "#3b4252",
      gray: "#4c566a",
      darkgray: "#d8dee9",
      dark: "#eceff4",
      secondary: "#81a1c1",
      tertiary: "#88c0d0",
      highlight: "rgba(136, 192, 208, 0.15)",
      textHighlight: "#ebcb8b88",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    lightMode: {
      light: "#f8f8f2",
      lightgray: "#e6e6e6",
      gray: "#6272a4",
      darkgray: "#44475a",
      dark: "#282a36",
      secondary: "#7c3aed",
      tertiary: "#06b6d4",
      highlight: "rgba(124, 58, 237, 0.15)",
      textHighlight: "#f1fa8c88",
    },
    darkMode: {
      light: "#282a36",
      lightgray: "#44475a",
      gray: "#6272a4",
      darkgray: "#f8f8f2",
      dark: "#f8f8f2",
      secondary: "#bd93f9",
      tertiary: "#8be9fd",
      highlight: "rgba(189, 147, 249, 0.15)",
      textHighlight: "#f1fa8c88",
    },
  },
  {
    id: "solarized",
    name: "Solarized",
    lightMode: {
      light: "#fdf6e3",
      lightgray: "#eee8d5",
      gray: "#93a1a1",
      darkgray: "#586e75",
      dark: "#073642",
      secondary: "#268bd2",
      tertiary: "#2aa198",
      highlight: "rgba(38, 139, 210, 0.15)",
      textHighlight: "#b5890088",
    },
    darkMode: {
      light: "#002b36",
      lightgray: "#073642",
      gray: "#586e75",
      darkgray: "#93a1a1",
      dark: "#fdf6e3",
      secondary: "#268bd2",
      tertiary: "#2aa198",
      highlight: "rgba(38, 139, 210, 0.15)",
      textHighlight: "#b5890088",
    },
  },
]

function colorSchemeVars(scheme: ColorScheme): string {
  return `  --light: ${scheme.light};
  --lightgray: ${scheme.lightgray};
  --gray: ${scheme.gray};
  --darkgray: ${scheme.darkgray};
  --dark: ${scheme.dark};
  --secondary: ${scheme.secondary};
  --tertiary: ${scheme.tertiary};
  --highlight: ${scheme.highlight};
  --textHighlight: ${scheme.textHighlight};`
}

export function joinStyles(theme: Theme, ...stylesheet: string[]) {
  // Generate CSS for non-default theme presets
  const presetCss = themePresets
    .filter((p) => p.id !== "default")
    .map(
      (p) => `
:root[data-theme="${p.id}"] {
${colorSchemeVars(p.lightMode)}
}

:root[data-theme="${p.id}"][saved-theme="dark"] {
${colorSchemeVars(p.darkMode)}
}`,
    )
    .join("\n")

  return `
${stylesheet.join("\n\n")}

:root {
${colorSchemeVars(theme.colors.lightMode)}

  --titleFont: "${getFontSpecificationName(theme.typography.title || theme.typography.header)}", ${DEFAULT_SANS_SERIF};
  --headerFont: "${getFontSpecificationName(theme.typography.header)}", ${DEFAULT_SANS_SERIF};
  --bodyFont: "${getFontSpecificationName(theme.typography.body)}", ${DEFAULT_SANS_SERIF};
  --codeFont: "${getFontSpecificationName(theme.typography.code)}", ${DEFAULT_MONO};
}

:root[saved-theme="dark"] {
${colorSchemeVars(theme.colors.darkMode)}
}

${presetCss}
`
}
