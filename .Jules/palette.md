## 2025-05-14 - [Mobile Menu Accessibility & Pricing Refactor]
**Learning:** Fixing broken JS-to-CSS selector mismatches in navigation is a high-impact UX win. Additionally, refactoring inline event handlers (onmouseover) to CSS not only complies with CSP but provides a more performant interaction.
**Action:** Always check `aria-expanded` states when adding "click outside to close" logic for mobile menus to ensure screen reader synchronization.
