## 2025-05-14 - Global Copy to Clipboard Pattern
**Learning:** For a static landing page with multiple snippets, a global event-delegated copy utility reduces code duplication and ensures consistent feedback (toasts and visual state) across all pages.
**Action:** Use the `data-copy="<selector>"` attribute on buttons to trigger the global utility, and provide a unique ID to the target element. Use `.btn-success-temporary` for immediate visual confirmation.
