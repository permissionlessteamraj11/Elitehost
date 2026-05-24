## 2025-05-24 - [Global Copy Utility Implementation]
**Learning:** Adding a global copy-to-clipboard utility with visual feedback significantly improves the perceived responsiveness of the app. Using event delegation for `data-copy` attributes allows for easy integration across different pages without redundant JavaScript.
**Action:** Use the established `.btn-success-temporary` pattern and `initCopyUtility` for any future copy actions to maintain UI consistency.

## 2025-05-24 - [Mobile Menu ID Synchronization]
**Learning:** Inconsistent IDs between HTML (`#navLinks`) and JavaScript (`#mobileMenu`) can lead to broken mobile navigation that is hard to debug without full-page inspection.
**Action:** Always verify that DOM IDs used in global scripts match the templates exactly. Use `aria-controls` to semantically link triggers to their targets.
