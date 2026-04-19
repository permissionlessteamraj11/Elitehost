## 2025-04-19 - [Accessibility & Mobile Navigation Synchronization]
**Learning:** Accessibility standards require 'aria-expanded' and 'aria-controls' attributes to be programmatically synchronized across all interaction paths (toggles, link selections, and clicks outside) to ensure screen readers accurately reflect the UI state.
**Action:** When implementing mobile menus or accordions, ensure that every code path that closes the menu (e.g., clicking a link inside, clicking an overlay) also updates the 'aria-expanded' attribute on the trigger button.
