## 2025-05-14 - Focus Parity for Simulations
**Learning:** Interactive UI simulations (like the hero terminal) that only trigger on `mouseenter` are inaccessible to keyboard and screen reader users.
**Action:** Always pair `mouseenter`/`mouseleave` with `focusin`/`focusout` and ensure the element has `tabindex="0"` and a descriptive `aria-label`.

## 2025-05-14 - Micro-UX Scope Discipline
**Learning:** Attempting multiple "micro" fixes in a single PR can be perceived as scope creep or lead to regressions if not perfectly synchronized across HTML/JS/CSS.
**Action:** Strictly limit each task to ONE logical micro-UX improvement to ensure high quality and easier verification.
