/**
 * Hex colors for HTML email (email clients do not support oklch()).
 * Sourced from operational-plan-website/src/index.css :root tokens.
 *
 * | Token              | CSS value                      |
 * |--------------------|--------------------------------|
 * | background         | oklch(0.965 0.003 250)         |
 * | foreground         | oklch(0.22 0.04 265)           |
 * | card               | oklch(1 0 0)                   |
 * | primary            | oklch(0.70 0.18 47)            |
 * | primaryForeground  | oklch(0.99 0 0)                |
 * | muted              | oklch(0.96 0.005 250)          |
 * | mutedForeground    | oklch(0.55 0.015 255)          |
 * | border             | oklch(0.92 0.005 250)          |
 * | sidebar            | oklch(0.22 0.045 265)          |
 * | sidebarForeground  | oklch(0.86 0.01 250)           |
 * | chart-2            | oklch(0.83 0.13 145)           |
 * | chart-3            | oklch(0.92 0.13 95)            |
 * | destructive        | oklch(0.62 0.22 25)            |
 */
const PRIMARY_OKLCH = "oklch(0.70 0.18 47)"
/** sRGB fallback when oklch() is unsupported (matches --primary in index.css) */
const PRIMARY_HEX = "#c9972a"

const EMAIL_THEME = {
  background: "#f2f4f7",
  foreground: "#2c3548",
  card: "#ffffff",
  primary: PRIMARY_OKLCH,
  primaryHex: PRIMARY_HEX,
  primaryForeground: "#fafafa",
  muted: "#f3f5f8",
  mutedForeground: "#6f7a8f",
  border: "#e6e9ee",
  sidebar: "#1f2a42",
  sidebarForeground: "#d5dae3",
  chart2: "#5fc97a",
  chart2Muted: "#e9f6ee",
  chart2Border: "#c5e8d0",
  chart2Text: "#2d6b42",
  chart3: "#f5e063",
  chart3Muted: "#fdf8e0",
  chart3Border: "#f0e4a8",
  chart3Text: "#6b5f1a",
  destructive: "#d94a4a",
}

module.exports = { EMAIL_THEME, PRIMARY_OKLCH, PRIMARY_HEX }
