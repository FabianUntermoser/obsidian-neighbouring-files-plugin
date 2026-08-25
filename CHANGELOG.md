# Changelog

## 1.2.0

### What's New

- **Mobile navigation button (FAB).** A floating action button that works only on mobile. Configure four swipe gestures (left, right, up, down) to run commands, plus tap, double-tap, and long-press actions. Long-press then drag to reposition the button. Gesture commands, haptics, and position are all configurable in Settings → Mobile.

### Dependency Updates

- js-yaml: bumped to close a security advisory (4.3.1 / 3.15.1)
- obsidian: 1.12.3 → 1.13.1
- eslint-plugin-obsidianmd: 0.3.0 → 0.4.1
- @types/node: 25.9.5 → 26.1.1
- @typescript-eslint/eslint-plugin: 8.63.0
- CI actions: setup-node → 7.0.0, checkout → 7.0.1, attest-build-provenance updated

## 1.1.4

### Patch Changes

- Fix: sort child folders alphabetically to prevent Android folder skip on rename.

## 1.1.3

### Patch Changes

- 94d0d80: upgrade dependencies
- 381ea24: add folder based navigation commands (up, down, next, prev)
- 611e505: Add option to navigate across folder boundaries

## 1.1.2

### Patch Changes

- 34ab5ef: add obsidian vault for manual plugin testing
- be9e843: setup @changesets/cli for changelog

## 1.1.1

- Add setting to control navigation behaviour on folder end by @FabianUntermoser in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/23
- Add setting to filter based on extension by @brendon-felix in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/22

## 1.1.0

### Breaking Changes

- The default command for navigation now follows the sort order defined by the file explorer. If you used the default command for navigation, you might need to change your shortcut to use a specific navigation command.
- The sorting of files based on the modification timestamp has been swapped to match Obsidians behaviour.

### What's Changed

- feat: support reverse sorting and use file explorer sort order by @brendon-felix in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/17
- Swap Next/Prev for time-based ordering to match Obsidian by @FabianUntermoser in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/21

## 1.0.7

- Support File Sorting by Modification/Creation Timestamp #13 ([PR](https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/15))

## 1.0.6

Fix: Support Johny Decimal Sorting [#6](https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/issues/6) ([PR](https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/9))

## 1.0.5

- Fix case-insensitive navigation `#7` ([PR](https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/8))

## 1.0.4

**Fixes**

- fix: restrict navigation to only open markdown files @clemens-holleis in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/3
    - prevent empty folder creation
    - avoid opening files other than markdown files in external programs (.ods, .xlsx, ...)

**Maintenance**

- feat(ci): run build for new PRs by @FabianUntermoser in https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin/pull/4

## 1.0.3

Publish Obsidian Community Plugin

## 1.0.2

Shorten Command Descriptions.

## 1.0.1

Sort neighbouring files before navigating.
