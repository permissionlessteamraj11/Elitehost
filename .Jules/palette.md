## 2025-05-15 - [Accessible Shared Components]
**Learning:** Shared UI components like `GlassCard` that are used for interactive elements (e.g., `DeployOptionCard`) must support keyboard navigation and semantic roles. Using `focus-visible` ensures focus rings only appear for keyboard users, maintaining the visual aesthetic for others.
**Action:** Always include `tabIndex`, `onKeyDown`, and `role` props in shared interactive components and apply `focus-visible` styling.
