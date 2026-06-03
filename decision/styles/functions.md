# Sass Functions Reference Guide

This document lists and explains all helper functions declared in [src/app/styles/config/_functions.scss](file:///Users/tanmay/Documents/poc/saas/src/app/styles/config/_functions.scss). These functions perform unit conversions, nested key lookups, aspect ratio calculations, and fluid clamp calculations.

---

## 1. Map Helpers

### `map-deep-get($map, $keys...)`
Pulls a value out of a nested, multi-dimensional map.
* **Arguments:** 
  - `$map`: The map to inspect.
  - `$keys...`: Variadic arguments representing the keys sequence (from parent to child).
* **Usage:**
  ```scss
  $color-red-500: map-deep-get($colors, 'red', '500');
  ```

---

## 2. Responsive Infix Generation

### `breakpoint-infix($name, $breakpoints)`
Generates responsive infix class naming patterns (e.g. returning `-md` for medium screens, and empty string `''` for base screens).
* **Arguments:** 
  - `$name`: The breakpoint name.
  - `$breakpoints`: (Optional) Breakpoint map fallback.
* **Usage:**
  ```scss
  $infix: breakpoint-infix('md'); // returns '-md'
  $base-infix: breakpoint-infix('xs'); // returns ''
  ```

---

## 3. Unit Conversion & Scaling

### `strip-unit($number)`
Removes the unit suffix (such as `px`, `rem`, `em`) from a number, returning a pure scalar.
* **Usage:**
  ```scss
  $scalar: strip-unit(16px); // returns 16
  ```

### `to-rem($value, $base-value)`
Converts a pixel value into its REM proportional equivalent based on a font-size baseline.
* **Arguments:**
  - `$value`: The pixel size to convert.
  - `$base-value`: (Optional) Font size baseline (defaults to `16px`).
* **Usage:**
  ```scss
  font-size: to-rem(24px); // returns 1.5rem
  ```

### `to-em($value, $base-value)`
Converts a pixel value into its EM proportional equivalent. Useful for spacing attributes that should scale relatively to their parent's current font size.
* **Usage:**
  ```scss
  margin-bottom: to-em(12px, 24px); // returns 0.5em
  ```

### `px-to-rem($px)`
Helper function returning the rem representation of a pixel measurement by dividing it by `16px`.
* **Usage:**
  ```scss
  padding: px-to-rem(32px); // returns 2rem
  ```

---

## 4. Spacing Calculation

### `getSpacingValue($value)`
Standardizes spacing values by converting raw numeric values to REM.
* **Arguments:**
  - `$value`: Pixel length to convert.
* **Usage:**
  ```scss
  width: getSpacingValue(80); // returns 5rem
  ```

---

## 5. String Manipulation

### `str-replace($string, $search, $replace)`
Recursively replaces characters or substrings within a text string.
* **Usage:**
  ```scss
  $icon-path: str-replace('assets/icons/home.png', 'home', 'user'); // returns 'assets/icons/user.png'
  ```

---

## 6. Layout Metrics

### `z-index($key)`
Returns custom properties variables representing z-index offsets, throwing descriptive compilation errors if the requested key does not exist.
* **Usage:**
  ```scss
  z-index: z-index('modal'); // returns var(--z-index-modal)
  ```

### `aspect-ratio($width, $height)`
Calculates the aspect-ratio percentage, which is useful when building padding-bottom ratios for responsive embeds.
* **Usage:**
  ```scss
  padding-bottom: aspect-ratio(16, 9); // returns 56.25%
  ```

### `round($number, $decimals)`
Rounds a floating-point number to a specified number of decimal places.
* **Usage:**
  ```scss
  $rounded: round(1.23456, 2); // returns 1.23
  ```

---

## 7. Fluid Typography Engine

### `fluid($min-size, $max-size, $min-breakpoint, $max-breakpoint, $unit)`
Dynamically scales a value (like font-size or padding) between a minimum and maximum size based on viewport width. Once the viewport boundaries are crossed, the value clamps to the minimum or maximum boundaries.

This helps eliminate multiple media query breakpoints for typography.

* **Arguments:**
  - `$min-size`: Proportional minimum boundary size (in pixels).
  - `$max-size`: Proportional maximum boundary size (in pixels).
  - `$min-breakpoint`: (Optional) Minimum viewport boundary (defaults to `20rem` [320px]).
  - `$max-breakpoint`: (Optional) Maximum viewport boundary (defaults to `80rem` [1280px]).
  - `$unit`: (Optional) Dynamic CSS viewport units (defaults to `vw`).
* **Return Value:** A CSS `clamp()` function.
* **Usage:**
  ```scss
  // Scales text fluidly from 16px to 32px as viewport width ranges from 320px to 1280px
  h1 {
    font-size: fluid(16px, 32px);
  }
  ```
* **Output CSS:**
  ```css
  h1 {
    font-size: clamp(16px, 1.67vw + 10.67px, 32px);
  }
  ```
