# Palette's UX Journal

## 2025-05-15 - [Mobile Navigation Accessibility & Global Copy Utility]
**Learning:** In a static site with shared page logic, centralizing mobile navigation and utility interactions (like clipboard copying) in a single module (e.g., `landing.js`) ensures consistency across all marketing pages and simplifies accessibility maintenance. Refactoring selectors from non-existent IDs (`mobileMenu`) to correct ones (`navLinks`) while synchronizing ARIA attributes (`aria-expanded`, `aria-hidden`) and adding viewport resize listeners is crucial for a robust responsive experience.
**Action:** Always verify selector-ID parity between JS and HTML. Use event delegation for global utilities to reduce repeated code and improve maintainability.
