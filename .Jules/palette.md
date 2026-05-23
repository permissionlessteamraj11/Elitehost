## 2025-05-14 - [Mobile Navigation & Accessibility Consolidation]
**Learning:** In highly customized 'Elite' themes, global UI handlers (like `initFAQ`) must account for diverse icon styles (SVG vs. Unicode) used across marketing pages. Redundant inline scripts often arise from quick fixes and lead to event duplication.

**Action:** Always prefer centralizing UI logic in `js/pages/landing.js` and use dynamic feature detection (e.g., checking for child `span` or `svg`) to apply correct state changes.
