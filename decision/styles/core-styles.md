# Colors & Core Resets Architecture

This document describes the color engine and browser normalizations implemented in [src/app/styles/core/_colors.scss](file:///Users/tanmay/Documents/poc/saas/src/app/styles/core/_colors.scss) and [src/app/styles/core/_reset.scss](file:///Users/tanmay/Documents/poc/saas/src/app/styles/core/_reset.scss).

---

## 1. The OKLCH Color Engine

Our colors are defined using OKLCH coordinates (`oklch(L C H)`), which maintain perceptually uniform lightness across different hues. This makes it easier to establish consistent contrast ratios for accessibility.

### Semantic Color Roles
Each visual role is defined with a background color and a corresponding high-contrast **content color** to guarantee text readability:

| Role Name | Background Color (OKLCH) | Content/Text Color (OKLCH) | Purpose |
|:----------|:-------------------------|:---------------------------|:--------|
| **Base 100** | `oklch(100% 0 0)` | `oklch(20% 0 0)` | Primary page background |
| **Base 200** | `oklch(97% 0 0)` | `oklch(20% 0 0)` | Sidebar, inputs, card backgrounds |
| **Base 300** | `oklch(92% 0 0)` | `oklch(20% 0 0)` | Banners, borders, dividers |
| **Primary** | `oklch(85% 0.199 91.936)` | `oklch(42% 0.095 57.708)` | Key actions, active states, focus accents |
| **Secondary**| `oklch(75% 0.183 55.934)` | `oklch(40% 0.123 38.172)` | Alternative actions |
| **Success** | `oklch(76% 0.177 163.223)`| `oklch(37% 0.077 168.94)` | Valid status signals, positive alerts |
| **Warning** | `oklch(82% 0.189 84.429)` | `oklch(41% 0.112 45.904)` | Cautions, warnings |
| **Error** | `oklch(70% 0.191 22.216)` | `oklch(39% 0.141 25.723)` | Critical states, failed validation alerts |

---

## 2. Color Palettes & Shade Maps

The `$colors` map defines 50-950 shade steps across various color families (`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`).

### Proportional OKLCH Scaling
Shades scale systematically:
- **50 to 300:** Light, low-chroma shades (Lightness > 80%). Ideal for alerts background or hover backdrops.
- **400 to 700:** Medium, high-chroma shades (Lightness 50% to 80%). Ideal for primary theme components.
- **800 to 950:** Dark shades (Lightness < 50%). Ideal for text colors, headers, and borders.

*Example:*
```scss
'red': (
  '50':  oklch(97.1% 0.013 17.38),   // Very light pinkish background
  '500': oklch(63.7% 0.237 25.331),   // Vivid primary red
  '950': oklch(25.8% 0.092 26.042)    // Deep blood-red border text
)
```

---

## 3. Global CSS Reset & Normalization

The reset module overrides default browser styles to provide a consistent baseline across different layout rendering engines.

### Box-Sizing
Standardizes layout dimensions to include borders and padding within width/height calculations, avoiding unexpected sizing behavior:
```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### Typography Baseline
Sets defaults on the `html` and `body` elements using our configuration tokens:
* Font family defaults to `Inter` (sans-serif fallbacks).
* Line height is set to `1.5` to maintain readable line spacing.
* Text anti-aliasing is enabled to ensure crisp typography rendering on digital screens.

---

## 4. Accessibility Integrations in the Reset

### Smooth Scrolling & Reduced Motion
Scroll behavior defaults to `smooth`. If a user enables "Reduce Motion" in their operating system settings, the reset automatically disables smooth scrolling to accommodate their preferences:
```scss
html {
  scroll-behavior: smooth;

  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
}
```

### Global Animation Disabling
If a user requests reduced motion, all animations, transitions, and layout transforms are disabled:
```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Links & Interactive Actions
* Links are styled to use the `Primary` theme color and underline on hover.
* Outlines are styled to use `focus-outline` on keyboard focus (`:focus-visible`), ensuring focus indicators remain visible for keyboard-navigating users.

### Form Element Resets
Normalizes inputs, select boxes, buttons, and textareas:
* Buttons default to `cursor: pointer`.
* Firefox inner borders and padding are removed.
* Number input spinner buttons are normalized.
* Textareas are configured with `resize: vertical` to prevent horizontal layout breaks.
