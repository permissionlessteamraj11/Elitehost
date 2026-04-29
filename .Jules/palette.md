## 2025-05-15 - [Mobile Menu ID Standardization]
**Learning:** In this application, the mobile navigation container consistently uses the ID `#navLinks` and the visibility class `.mobile-open` across all pages (index.html, pricing.html, features.html). The JavaScript logic in `js/pages/landing.js` must align with these identifiers to avoid breaking the responsive menu.
**Action:** Always verify that navigation logic targets `#navLinks` and uses `.mobile-open` for state toggling.

## 2025-05-15 - [Counter Attribute Synchronization]
**Learning:** Numerical counters on the landing page are animated by `js/pages/landing.js` which looks for the `data-counter` attribute. Mismatched attributes like `data-target` in the HTML will prevent counters from initializing.
**Action:** Ensure all counter elements use the `data-counter` attribute for target values.
