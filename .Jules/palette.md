## 2025-05-14 - Semantic Switch Toggles
**Learning:** Using `div` elements for toggles/switches prevents keyboard users from interacting with them and hides their state/purpose from screen readers. Semantic `button` elements with `role="switch"` and `aria-checked` are necessary for a truly accessible experience.
**Action:** Always implement interactive toggles using `<button role="switch">` and ensure they have visible focus indicators (`focus-visible`).
