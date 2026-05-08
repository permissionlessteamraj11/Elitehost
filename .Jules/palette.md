## 2025-05-14 - [Mobile Navigation & Interactive Terminal Accessibility]
**Learning:** Interactive elements triggered by mouse hover (like the hero terminal) are invisible to keyboard users unless they are made focusable and given focus event listeners. Mobile navigation requires careful synchronization of ARIA attributes (`aria-expanded`, `aria-hidden`) and viewport-aware state cleanup (resize listener).

**Action:** Always add `tabindex="0"` and mirror mouse events with `focusin`/`focusout` for interactive simulations. Use debounced resize listeners to reset mobile-only styles like body scroll locking and ARIA states when transitioning to desktop viewports.
