## 2025-05-14 - Accessible and Interactive Notification Toggles
**Learning:** Static `div`-based UI components mimicking interactive elements (like toggles) are common UX pitfalls. Converting them to semantic `button` elements with `role="switch"` and `aria-checked` provides immediate accessibility for screen readers and keyboard users.
**Action:** Always check if custom UI components like switches, checkboxes, or tabs are using semantic elements and have appropriate ARIA roles and states.
