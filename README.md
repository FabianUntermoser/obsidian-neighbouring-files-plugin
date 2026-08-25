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

## Features
- Navigate to the next / previous file, alphabetical or by creation / modification date
- Navigate folders up, down, and between
- Loop in a folder or continue across folders
- Mobile floating action button (FAB) with gestures

## Commands

Default commands:
- Navigate to next file
- Navigate to prev file

Additional commands:
- Navigate to next file (alphabetical)
- Navigate to prev file (alphabetical)
- Navigate to older file (creation timestamp)
- Navigate to newer file (creation timestamp)
- Navigate to older file (modified timestamp)
- Navigate to newer file (modified timestamp)
- Folder up
- Folder down
- Next folder
- Prev folder

Sorting modes:
- **Alphabetical**: by file name
- **By modification timestamp**
- **By creation timestamp**

## Configuration

### Sort Order
The default command uses the same sort order as the [File explorer](https://help.obsidian.md/Plugins/File+explorer). Set a fallback in the plugin settings.

### Included File Types
Markdown only by default. In the settings you can:
- Limit to markdown files only
- Include all file types
- Add specific file extensions

### Loop Notes in Folder
- **Disabled**: navigation stops at the folder edges
- **Enabled**: navigation loops back to the first / last note

### Continue Across Folders
- **Disabled**: navigation stays within the current folder
- **Enabled**: navigation continues into adjacent folders

### Mobile Navigation Button (FAB)
On mobile, a floating button appears when a note is open. Gestures:
- **Swipe left / right / up / down**: run a command (defaults: left = next, right = prev, up = folder up, down = folder down)
- **Tap**: run a command (default: none)
- **Double-tap**: run a command (default: none)
- **Long-press**: open FAB settings
- **Long-press + drag**: reposition the button

Set gesture commands in settings under **Mobile**, or long-press the button. Haptics toggle available.

## Keybindings

### Obsidian Hotkeys
Open `Settings` -> `Hotkeys`, search `neighbouring-files`, and assign keys to the commands you need. The command IDs follow the command names (e.g. `neighbouring-files:next`).

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

## License
[MIT License](LICENSE.md).
