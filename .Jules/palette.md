# Palette's UX Journal

## 2025-05-15 - Improving Dashboard Accessibility
**Learning:** Icon-only buttons and interactive cards without proper ARIA labels and keyboard support hinder accessibility for screen reader and keyboard users in a complex dashboard environment.
**Action:** Always provide explicit `aria-label` for icon-only buttons and ensure interactive cards support keyboard navigation (`tabIndex`, `onKeyDown`) and semantic roles (`role="radio"` for selection).
