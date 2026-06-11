# Palette's Journal - EliteHosting

## 2025-05-15 - Hallucinatory Accessibility Memories
**Learning:** Previous session memories might claim accessibility features (aria-labels, role="switch") that are not actually present in the current codebase state. Always verify actual code before assuming a11y is complete.
**Action:** Perform a manual audit of interactive elements even if memory suggests they are optimized.

## 2025-05-15 - Integrated Feedback vs. Native Alerts
**Learning:** Native `alert()` calls break the immersion of a premium "futuristic" dashboard. Inline success states and icon swaps (e.g., Copy -> Check) provide a much smoother experience.
**Action:** Prioritize replacing `alert()` with inline feedback in high-traffic pages like Settings.
