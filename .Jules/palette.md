## 2025-05-17 - Unified Mobile Navigation State Management
**Learning:** Managing mobile menu visibility solely through classes often leads to desynchronized ARIA attributes and accessibility issues (e.g., body scrolling while menu is open). A centralized `setMenuState` helper ensures that `.mobile-open`, `aria-expanded`, `aria-hidden`, and `overflow: hidden` are always in sync.
**Action:** Use a unified state helper for complex UI toggles to ensure accessibility attributes (ARIA) and layout locks (body scroll) never drift from the visual state.
