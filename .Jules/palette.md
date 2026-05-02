# Palette's UX Journal 🎨

Critical UX and accessibility learnings for EliteHost.

## 2025-05-22 - Keyboard Focus for Interactive Regions
**Learning:** Interactive regions that provide useful information on hover (like the system status terminal) must also be accessible via keyboard.
**Action:** Always add `tabindex="0"` to informative hover-active elements and ensure they respond to `focusin` and `focusout` events.
