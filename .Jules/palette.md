## 2026-05-16 - Accessible Mobile Navigation & Scroll Locking
**Learning:** Mobile menus often suffer from inconsistent ARIA states and "background scrolling" which disorients users. Synchronizing `aria-expanded` on the trigger, `aria-hidden` on the menu, and `overflow: hidden` on the body creates a native-feeling modal experience.
**Action:** Use a centralized `setMenuState` helper and a debounced resize listener to manage navigation state transitions and accessibility attributes consistently.
