## 2025-05-15 - [ARIA Expanded State Management]
**Learning:** For mobile navigation menus, the 'aria-expanded' attribute on the toggle button often becomes desynchronized if only the toggle action is handled. Users expect the screen reader to reflect the state correctly even when the menu closes via link selection or clicking outside.
**Action:** Always programmatically synchronize 'aria-expanded' across all logical closure paths (link clicks, escape key, outside clicks) in addition to the primary toggle button interaction.
