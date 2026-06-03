# Design Tokens & Configuration

This document outlines the token maps and global design variables defined in [src/app/styles/config/_variables.scss](file:///Users/tanmay/Documents/poc/saas/src/app/styles/config/_variables.scss). These variables represent the core visual constants of our design system.

---

## 1. Responsive Breakpoints

We adopt a mobile-first approach. All breakpoints are declared in **REMs** to ensure responsive queries scale proportionally if the user changes their browser's default font size:

| Breakpoint Key | Value (rem) | Pixel Equivalent (at 16px base) | Target Devices |
|:--------------:|:-----------:|:------------------------------:|:--------------|
| `xs`           | `20rem`     | `320px`                        | Small phones  |
| `sm`           | `40rem`     | `640px`                        | Large phones / Small tablets |
| `md`           | `48rem`     | `768px`                        | Tablets |
| `lg`           | `64rem`     | `1024px`                       | Small laptops |
| `xl`           | `80rem`     | `1280px`                       | Standard desktops |
| `xxl`          | `96rem`     | `1536px`                       | Large screens |

*Variable:* `$breakpoints`

---

## 2. Spacing Scale

Our spacing scale is built on a linear-to-exponential system. Spacing integers are translated to REM units by multiplying with the base `$spacer` variable (`1rem`):

- **1 to 8:** Tight linear spacing (steps of `0.25rem` up to `2rem`).
- **9 to 20:** Loose layout spacing (steps of `1rem` up to `4rem`, then doubling or tripling up to `160rem`).

### Spacing Map Snippet
```scss
$spacer: 1 !default;
$spacers: (
  1: $spacer * 0.25,   // 0.25rem  (4px)
  2: $spacer * 0.5,    // 0.50rem  (8px)
  3: $spacer * 0.75,   // 0.75rem  (12px)
  4: $spacer,          // 1.00rem  (16px)
  ...
  11: $spacer * 8,     // 8.00rem  (128px)
  20: $spacer * 160    // 160.0rem (2560px)
) !default;
```

---

## 3. Typography Scale

Our primary typography uses the **Inter** font family, with fallback fonts defined for sans, serif, and monospace formats.

### Font Sizing Scale
Font sizes scale proportionally from a `1rem` base:

- `$font-size-xs`: `0.75rem` (12px)
- `$font-size-sm`: `0.875rem` (14px)
- `$font-size-base`: `1rem` (16px)
- `$font-size-lg`: `1.25rem` (20px)
- `$font-size-xl`: `1.5rem` (24px)
- `$font-size-2xl`: `1.875rem` (30px)
- `$font-size-3xl`: `2.25rem` (36px)
- `$font-size-4xl`: `3rem` (48px)
- `$font-size-5xl`: `3.75rem` (60px)

### Font Weights
- `Light`: `300`
- `Normal`: `400`
- `Medium`: `500`
- `Semibold`: `600`
- `Bold`: `700`

---

## 4. Border Radius Tokens

Standardized corner radii allow UI components (buttons, text inputs, modal cards) to maintain a cohesive visual rhythm:

- `sm`: `0.125rem` (2px)
- `default`: `0.25rem` (4px)
- `md`: `0.375rem` (6px)
- `lg`: `0.5rem` (8px)
- `xl`: `0.75rem` (12px)
- `2xl`: `1rem` (16px)
- `3xl`: `1.5rem` (24px)
- `full`: `624.9375rem` (9999px - generates pill/circular shapes)

---

## 5. Shadow Tokens

Shadow maps represent depth and elevation within the layout, from flat panels to hovering popups and dropdown containers:

- `$shadow-sm`: Subtle elevation, ideal for flat cards and buttons.
- `$shadow`: Medium elevation, suitable for list items.
- `$shadow-md`: Default component elevation.
- `$shadow-lg`: Elevated cards, hover states, and banners.
- `$shadow-xl`: Modal overlays and sliding side panels.
- `$shadow-2xl`: Floating dialog boxes and popovers.
- `$shadow-inner`: Inset shadows, useful for form input wells and wells.

---

## 6. Z-Index Scale

To prevent conflicts where overlays overlap, we enforce a strict z-index scale:

| Z-Index Variable | Value | Purpose |
|:-----------------|:-----:|:--------|
| `$z-index-negative` | `-1` | Sending decorative background graphics backwards |
| `$z-index-base` | `1` | Default baseline elements |
| `$z-index-dropdown` | `1000` | Contextual menus |
| `$z-index-sticky` | `1020` | Sticky navigation headers |
| `$z-index-fixed` | `1030` | Persistent feedback bars |
| `$z-index-modal-backdrop` | `1040` | Dimming overlay under active modals |
| `$z-index-modal` | `1050` | Active dialog popups |
| `$z-index-popover` | `1060` | Interactive floating bubbles |
| `$z-index-tooltip` | `1070` | Text helper bubbles |

---

## 7. Motion & Transitions

Standardized transitions maintain a consistent animations speed across the product:

- `$transition-fast`: `150ms` (for micro-interactions, e.g. button hover states).
- `$transition-base`: `200ms` (for default size/movement transitions).
- `$transition-slow`: `300ms` (for large modal slides or fade transitions).
