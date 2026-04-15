## 2025-05-14 - Mobile Navigation Logic Mismatch
**Learning:** The landing page mobile navigation was non-functional because the JavaScript was targeting a non-existent ID (`mobileMenu`) and toggling a class (`open`) that didn't match the CSS (`mobile-open`). This highlight the importance of verifying that JS selectors and class toggles align exactly with the HTML structure and CSS definitions.
**Action:** Always cross-reference JS, HTML, and CSS when fixing or implementing navigation components to ensure IDs and state classes are synchronized.

## 2025-05-14 - Accessibility for Emoji Buttons
**Learning:** Emoji-based buttons without text labels are inaccessible to screen readers. Adding `aria-label` provides necessary context while maintaining the minimalist UI aesthetic.
**Action:** Use `aria-label` for all icon-only or emoji-only interactive elements.
