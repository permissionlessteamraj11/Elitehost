## 2025-05-14 - Keyboard Accessibility for Interactive Cards
**Learning:** Components like `GlassCard` that are used as interactive elements (via `onClick`) must explicitly implement keyboard accessibility (`role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space) because `div` elements are not natively focusable or interactive for screen readers and keyboard users.
**Action:** When adding `onClick` handlers to non-semantic elements (div, span, section), always ensure they are converted into accessible interactive components with proper ARIA roles and keyboard listeners.
