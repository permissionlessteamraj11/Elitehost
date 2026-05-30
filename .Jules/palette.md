## 2025-05-14 - [Accessibility & Keyboard Navigation]
**Learning:** Icon-only interactive elements in a high-fidelity dashboard (like Search, Notifications, and FABs) must have explicit `aria-label` attributes and visible focus indicators to be usable by keyboard and screen-reader users. Additionally, nesting a `<button>` inside a `<Link>` is a semantic error that confuses assistive technologies.
**Action:** Use the `.focus-ring` utility for consistent focus visibility and ensure all icon-only buttons have `aria-label`. When using `next/link` for button-like actions, style the link directly or use a `motion.div` inside it instead of a `<button>`.

## 2025-05-14 - [Skip to Main Content]
**Learning:** In complex layouts with persistent sidebars and headers, keyboard users are forced to tab through many navigation items before reaching the main content.
**Action:** Implement a "Skip to main content" link as the first focusable element in the dashboard layout, targeting the main content container with a matching ID and `tabIndex={-1}`.
