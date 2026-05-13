# Palette's UX Journal

## 2026-05-13 - [Mobile Navigation Accessibility Patterns]
**Learning:** Modern mobile menus require synchronization of `aria-expanded` (on trigger), `aria-controls` (linking trigger to menu), and `aria-hidden` (on menu container) to ensure a consistent experience for screen reader users. Additionally, body scroll locking (`overflow: hidden`) prevents background scrolling which improves focus containment and UX.

**Action:** Always implement the "Holy Trinity" of mobile menu a11y: `aria-expanded`, `aria-controls`, and `aria-hidden`. Use a central `setMenuState` function to keep these in sync.
