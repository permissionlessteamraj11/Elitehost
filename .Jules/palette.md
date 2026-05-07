## 2025-05-14 - Navigation ID Consistency
**Learning:** In projects with multiple marketing pages (index, pricing, etc.), ensuring ID consistency for core UI components (like navigation) is crucial when refactoring shared JavaScript. A mismatch in IDs can break functionality across the entire site.
**Action:** Always verify that JS selectors match the HTML across ALL pages before committing changes.

## 2025-05-14 - Body Scroll Locking
**Learning:** When implementing mobile menus, locking the background scroll (`overflow: hidden`) provides a significantly better UX by preventing the user from losing their place on the page while interacting with the menu.
**Action:** Include body scroll locking in all full-screen or high-priority mobile overlays.
