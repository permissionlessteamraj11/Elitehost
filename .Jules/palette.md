## 2026-05-10 - Mobile Navigation Accessibility & Functional Fix
**Learning:** In projects with multiple marketing pages (index, pricing, features), navigation logic must be robust across viewport changes and follow ARIA standards (aria-expanded, aria-hidden, aria-controls) to ensure screen reader compatibility. A mismatch between JS selectors (e.g., #mobileMenu) and HTML IDs (e.g., #navLinks) can break critical UI components.
**Action:** Always synchronize ARIA attributes with visibility states and use a debounced resize listener to manage accessibility attributes during viewport transitions.

## 2026-05-10 - ARIA Boolean Attributes & Type Safety
**Learning:** When programmatically setting ARIA boolean attributes (e.g., `aria-expanded`), ensure values are converted to explicit boolean strings (`"true"`, `"false"`) and handle nullish states to avoid setting the attribute to the string `"undefined"`.
**Action:** Use `String(isOpen)` when updating ARIA attributes in JS.
