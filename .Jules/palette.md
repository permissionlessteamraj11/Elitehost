## 2025-06-03 - [Semantic Toggles & Form Accessibility]
**Learning:** Placeholders in complex dashboard settings often use non-semantic `div` elements for interactive toggles and miss proper `htmlFor`/`id` associations, significantly hindering screen reader and keyboard navigation.
**Action:** Always audit form sections for missing `id` on inputs and replace `div` based toggles with `<button role="switch">` including `aria-checked` and `focus-visible` rings.
