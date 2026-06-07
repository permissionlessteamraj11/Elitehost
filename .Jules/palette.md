## 2025-05-15 - [Accessible Notification Toggles]
**Learning:** In modern dashboard UIs, interactive elements like toggles are often implemented as static `div` elements with just a "switch-like" appearance. This breaks keyboard accessibility and screen reader support. Converting them to semantic `<button>` elements with `role="switch"` and `aria-checked` provides a much better experience for all users.
**Action:** Always check if custom "switch" or "toggle" components are using semantic buttons and have appropriate ARIA attributes.
