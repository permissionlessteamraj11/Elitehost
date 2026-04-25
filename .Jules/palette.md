
## 2025-04-25 - CSP and Inline Event Handlers
**Learning:** Strict Content Security Policy (CSP) settings in this repository prohibit the use of inline JavaScript event handlers (like onmouseover, onclick). Using them results in silent failures or browser console errors.
**Action:** Always implement UI interactions via external script files or CSS classes. Move any existing inline handlers to CSS hover states or JS event listeners.
