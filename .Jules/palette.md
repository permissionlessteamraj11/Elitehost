## 2025-04-30 - [Mobile Navigation Accessibility]
**Learning:** Mobile menus using CSS transforms (like `translateY(-100%)`) remain in the DOM and can be navigated by screen readers even when visually hidden. Using `aria-hidden` synchronized with the menu state is essential.
**Action:** Always pair `mobile-open` class toggles with `aria-hidden` and `aria-expanded` updates in JavaScript.

## 2025-04-30 - [Coordinated Identifiers]
**Learning:** Legacy JavaScript might use different IDs/classes than what is defined in the shared CSS/HTML (e.g., `mobileMenu` vs `navLinks`).
**Action:** Audit HTML and CSS files before fixing JavaScript to ensure semantic and functional alignment across the stack.
