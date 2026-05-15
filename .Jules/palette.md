## 2025-05-15 - Interactive State Accessibility
**Learning:** Interactive UI elements that use hover-only states (like terminal simulations or stats bars) are inaccessible to keyboard users. Adding `tabindex="0"` and mirroring hover logic with `focusin`/`focusout` listeners provides an equivalent experience for keyboard navigation.
**Action:** Always pair `mouseenter`/`mouseleave` with `focusin`/`focusout` for interactive animations, and ensure a visible focus indicator exists (either via default `:focus-visible` or custom styles).

## 2025-05-15 - Shared Script Usage
**Learning:** In this project, `js/pages/landing.js` serves as a shared utility script for all marketing pages (`index.html`, `features.html`, `pricing.html`). Logic added here is available globally across these pages, even if the filename suggests landing-page specificity.
**Action:** Place marketing-wide micro-UX improvements in `landing.js` to avoid duplicating logic across multiple HTML files.
