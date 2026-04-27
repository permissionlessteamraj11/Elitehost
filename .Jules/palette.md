## 2025-05-15 - Mobile Navigation & Counter Reconciliation
**Learning:** A mismatch existed between the landing page HTML attributes (`data-target`) and the JavaScript animation logic (`data-counter`), and between the mobile menu IDs (`navLinks` vs `mobileMenu`). Standardizing these across HTML and JS is critical for functional interactivity.
**Action:** Always verify that data attributes and IDs in HTML match the selectors and property accessors used in the corresponding JavaScript modules.
