## 2025-05-15 - Dashboard Accessibility Polish

**Learning:** Missing `htmlFor` and `id` associations on form labels significantly impact accessibility and reduce click targets. Icon-only buttons lacking `aria-label` are inaccessible to screen reader users. Refactoring non-semantic placeholders into functional components with proper ARIA roles (like `role="switch"`) enhances both usability and inclusive design.

**Action:** Always verify that every interactive element has a clear accessible name (`aria-label` or visible label), and ensure all form controls are correctly associated with their labels using `id` and `htmlFor`. When implementing custom interactive components like toggles, use semantic roles (`role="switch"`) and manage `aria-checked` states.
