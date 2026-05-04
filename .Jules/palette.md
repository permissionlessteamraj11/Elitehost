## 2026-05-04 - [Accessibility & Navigation Sync]
**Learning:** Mobile navigation visibility must be carefully synchronized with ARIA attributes (`aria-expanded`, `aria-hidden`) across all interaction paths (toggles, link clicks, outside clicks) and viewport resizes to ensure a consistent experience for screen reader users. Additionally, hover-based interactive elements should support keyboard focus (`tabindex="0"`, `focusin`/`focusout`) to be truly accessible.
**Action:** Always implement a centralized `toggleMenu` function for navigation to ensure attribute consistency, and ensure interactive demos have focus states.

## 2026-05-04 - [Global Copy-to-Clipboard Utility]
**Learning:** Using event delegation for a `data-copy` attribute combined with dynamic component imports (like `ToastManager`) provides a scalable, performance-efficient way to add clipboard functionality across the entire application without redundant code.
**Action:** Prefer `data-copy` attributes and delegated listeners for common UI interactions like copying.
