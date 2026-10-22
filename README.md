# Navigate to Neighbouring Files

<p align="left">
  <img alt="GitHub" src="https://img.shields.io/github/license/FabianUntermoser/obsidian-neighbouring-files-plugin?color=blue&style=flat-square">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/FabianUntermoser/obsidian-neighbouring-files-plugin?style=flat-square">
  <img alt="GitHub forks" src="https://img.shields.io/github/forks/FabianUntermoser/obsidian-neighbouring-files-plugin?style=flat-square">
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/FabianUntermoser/obsidian-neighbouring-files-plugin?color=blue&style=flat-square">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/FabianUntermoser/obsidian-neighbouring-files-plugin?color=blue&style=flat-square">
  <img alt="GitHub closed pull requests" src="https://img.shields.io/github/issues-pr-closed/FabianUntermoser/obsidian-neighbouring-files-plugin?color=blue&style=flat-square">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/FabianUntermoser/obsidian-neighbouring-files-plugin?color=blue&style=flat-square">
</p>

This [Obsidian](https://obsidian.md/) Plugin adds commands to quickly navigate between neighbouring files.

## Installation

[Install from the Obsidian community store](https://obsidian.md/plugins?id=neighbouring-files).

## Demo

**Navigating with shortcuts**

[obsidian-neighbouring-files.webm](https://github.com/user-attachments/assets/cdc04e2b-e3d9-4d77-8b2c-cbfa4ef4436d)

**Navigating with the mobile floating action button**

[mobile-fab.mp4](https://github.com/user-attachments/assets/573f5428-123b-43c6-98b5-d3f3d9f21493)

## Commands

Next and previous file, alphabetical or by creation or modification date, plus folder up, down, next and previous. The command palette lists them all, and the default command follows the sort order of the File explorer.

## Configuration

Settings explain themselves in the plugin settings. The mobile floating button is the exception worth knowing before you install:

On mobile, a floating button appears when a note is open. Gestures:

- **Swipe left, right, up, down**: run a command, defaults are next, prev, folder up, folder down
- **Tap and double-tap**: run a command, none by default
- **Long-press**: open the FAB settings
- **Long-press and drag**: move the button

Every gesture, the haptics toggle and both paddings are configurable, from settings under **Mobile** or by long-pressing the button.

## Keybindings

### VIMRC Keybindings
Instead of Obsidian hotkeys, use the [obsidian-vimrc-support](https://github.com/esm7/obsidian-vimrc-support) plugin to map keys like `gn` or `gp`.

> Caveat: works only when editor mode is on.

Example `.obsidian.vimrc`:
```vimrc
" navigation to neighbouring files
exmap next_file obcommand neighbouring-files:next
exmap prev_file obcommand neighbouring-files:prev
exmap next_file_alphabetical obcommand neighbouring-files:next-alphabetical
exmap prev_file_alphabetical obcommand neighbouring-files:prev-alphabetical
exmap older_file_created obcommand neighbouring-files:older-created
exmap newer_file_created obcommand neighbouring-files:newer-created
exmap older_file_modified obcommand neighbouring-files:older-modified
exmap newer_file_modified obcommand neighbouring-files:newer-modified
exmap folder_up obcommand neighbouring-files:folder-up
exmap folder_down obcommand neighbouring-files:folder-down
exmap folder_next obcommand neighbouring-files:folder-next
exmap folder_prev obcommand neighbouring-files:folder-prev
nmap gn :next_file<cr>
nmap gp :prev_file<cr>
nmap fu :folder_up<cr>
nmap fd :folder_down<cr>
nmap fn :folder_next<cr>
nmap fp :folder_prev<cr>
```

## Contributing
Open source on [GitHub](https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin). Issues and PRs welcome.

## Releasing

1. `make changeset`, then open the pull request and merge it green.
2. Run the community branch scan before the release merges: <https://community.obsidian.md/account/plugins/neighbouring-files/review-branch>
3. `make release`, then push the `release/<version>` branch and merge it.
4. `PUBLISH_OK=1 make publish`
5. Publish the draft release on GitHub.

## License
[MIT License](LICENSE.md).
