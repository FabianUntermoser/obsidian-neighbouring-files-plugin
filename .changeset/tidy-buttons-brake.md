---
"neighbouring-files": patch
---

Fix plugin failing to load on Android: the mobile FAB was created on the popout-window document, which is unavailable on mobile. Create it on the document body instead.
