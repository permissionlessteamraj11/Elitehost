## 2025-05-14 - [Accessibility in Custom Interaction Cards]
**Learning:** Generic `div` based cards used for selection (like deployment methods) are invisible to screen readers and keyboard users if not explicitly given `role="radio"`, `tabIndex`, and keyboard event listeners. Simply adding `onClick` is not enough for an inclusive experience.
**Action:** Always ensure interactive selection cards in this design system leverage the updated `GlassCard` accessibility props and implement `onKeyDown` handlers for Enter/Space keys.
