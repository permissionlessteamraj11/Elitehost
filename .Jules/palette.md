## 2025-04-23 - [Mobile Navigation Accessibility]
**Learning:** The mobile hamburger button was missing 'aria-controls' and the 'aria-expanded' state was not being reset when the menu closed via link selection or outside clicks. The JavaScript was also targeting a non-existent 'mobileMenu' ID instead of 'navLinks'.
**Action:** Always ensure 'aria-controls' links the toggle to the menu, and synchronize 'aria-expanded' across all closure paths. Ensure ID targets in JS match the actual DOM structure.
