# Sass Mixins Reference Guide

This document lists and explains all helper mixins declared in [src/app/styles/config/_mixins.scss](file:///Users/tanmay/Documents/poc/saas/src/app/styles/config/_mixins.scss). These mixins construct layout systems, generate CSS variables, wrap responsive media queries, and handle accessibility utilities.

---

## 1. Responsive Media Queries

These mobile-first media query wrappers automate breakpoint declarations using tokens configured in `$breakpoints`.

### `media-breakpoint-up($name, $breakpoints)`
Generates a min-width media query. Styles inside are applied at and above the specified screen size.
* **Usage:**
  ```scss
  .container {
    width: 100%;
    @include media-breakpoint-up('md') {
      width: 750px;
    }
  }
  ```

### `media-breakpoint-down($name, $breakpoints)`
Generates a max-width media query. Styles inside are applied at and below the specified screen size (subtracting `0.02px` from the boundary to prevent overlaps).
* **Usage:**
  ```scss
  .sidebar {
    display: block;
    @include media-breakpoint-down('lg') {
      display: none; // Hides sidebar on small laptops and below
    }
  }
  ```

### `media-breakpoint-between($lower, $upper, $breakpoints)`
Generates a range-bounded media query applying rules exclusively within a screen range.
* **Usage:**
  ```scss
  .banner {
    font-size: 1rem;
    @include media-breakpoint-between('md', 'lg') {
      font-size: 1.25rem; // Runs only on tablets and small laptops
    }
  }
  ```

---

## 2. Programmatic Utility Class Generators

These mixins automate class generation for utility maps.

### `generate-utility($property, $class, $values)`
Programmatically generates utility helper classes for a key-value value map.
* **Usage:**
  ```scss
  $displays: ('none': none, 'block': block, 'flex': flex);
  @include generate-utility('display', 'd', $displays);
  ```
* **Output CSS:**
  ```css
  .d-none { display: none !important; }
  .d-block { display: block !important; }
  .d-flex { display: flex !important; }
  ```

### `generate-responsive-utility($property, $class, $values, $breakpoints)`
Generates utility helper classes wrapped in mobile-first media query breakpoints.
* **Usage:**
  ```scss
  $overflows: ('auto': auto, 'hidden': hidden);
  @include generate-responsive-utility('overflow', 'overflow', $overflows);
  ```
* **Output CSS:**
  ```css
  .overflow-auto { overflow: auto !important; }
  @media (min-width: 640px) {
    .overflow-sm-auto { overflow: auto !important; }
  }
  @media (min-width: 768px) {
    .overflow-md-auto { overflow: auto !important; }
  }
  ```

---

## 3. Spacing Helpers (Pixel to REM Spacing)

These spacing helpers automatically divide pixel input by `16` to generate proportional REM values. This allows developers to work in pixel values while outputting relative REM units in the compiled CSS.

### Padding Helpers
- `@include padding(16)`: Sets padding of `1rem` on all sides.
- `@include paddingY(24)`: Sets vertical padding (`padding-top` and `padding-bottom`) of `1.5rem`.
- `@include paddingX(32)`: Sets horizontal padding of `2rem`.
- `@include paddingYX(16, 24)`: Sets vertical padding to `1rem` and horizontal padding to `1.5rem`.
- `@include padding4(8, 16, 12, 24)`: Sets top (`0.5rem`), right (`1rem`), bottom (`0.75rem`), and left (`1.5rem`) padding individually.

### Margin Helpers
- `@include margin(16)`
- `@include marginY(24)`
- `@include marginX(32)`
- `@include marginYX(16, 24)`
- `@include margin4(8, 16, 12, 24)`

---

## 4. Accessibility (A11y) & UX

### `sr-only`
Hides an element visually while keeping it accessible to screen readers.
* **Usage:**
  ```html
  <button>
    <span class="sr-only">Close Settings Dialog</span>
    <span aria-hidden="true">&times;</span>
  </button>
  ```

### `focus-outline`
Applies a consistent outline focus state that matches our brand color while preserving appropriate offset spacing.
* **Usage:**
  ```scss
  input:focus-visible {
    @include focus-outline;
  }
  ```

---

## 5. Webkit Layout Helpers

### `aspect-ratio($width, $height)`
Guarantees responsive box scaling based on aspect ratios, using absolute-position children.
* **Usage:**
  ```scss
  .video-container {
    @include aspect-ratio(16, 9);
  }
  ```

### `truncate`
Clips text to fit a single line and appends an ellipsis.
* **Usage:**
  ```scss
  .card-title {
    @include truncate;
  }
  ```

### `line-clamp($lines)`
Clips text to fit a specified number of lines, appending an ellipsis on the last line.
* **Usage:**
  ```scss
  .card-description {
    @include line-clamp(3); // Clamps paragraph at 3 lines
  }
  ```

---

## 6. CSS Custom Properties Registrars

### `generate-color-css-variables()`
Iterates through all color palettes, theme tokens, spacers, and breakpoint maps to register them as native CSS variables on `:root`.

* **Usage:**
  Simply register the mixin in the root file:
  ```scss
  @include generate-color-css-variables();
  ```
* **Variables generated on `:root`:**
  - `--color-primary`: oklch(85% 0.199 91.936)
  - `--color-primary-content`: oklch(42% 0.095 57.708)
  - `--color-base-100`: oklch(100% 0 0)
  - `--space-1`: 0.25rem
  - `--breakpoint-md`: 48rem
  - `--color-red-500`: oklch(63.7% 0.237 25.331)
  - `--radius-box`: 1rem
