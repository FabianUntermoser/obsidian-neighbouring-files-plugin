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

This [Obsidian](https://obsidian.md/) Plugin adds navigational commands that lets you quickly navigate to neighbouring files.

### Use Case

- Navigate to the next weekly from `2023-W17` to `2023-W18`
- Navigate to the next daily from `2023-04-31` to `2023-05-01`
- Navigate to the next file from `A4` to `A5`

[obsidian-neighbouring-files.webm](https://github.com/user-attachments/assets/cdc04e2b-e3d9-4d77-8b2c-cbfa4ef4436d)

### Usage

The default command uses the sort order from the [File explorer](https://help.obsidian.md/Plugins/File+explorer).
A fallback sort order is configurable in the plugin settings.

Default Commands:
- Navigate to next file
- Navigate to prev file

Commands:
- Navigate to next file (alphabetical)
- Navigate to prev file (alphabetical)
- Navigate to older file (creation timestamp)
- Navigate to newer file (creation timestamp)
- Navigate to older file (modified timestamp)
- Navigate to newer file (modified timestamp)

Supported Sorting Modes:
- Alphabetical: Ordered by file names.
- By Modification Timestamp: Based on the file modification date.
- By Creation Timestamp: Based on the file creation date.

## Configuration

Configure a hotkey to trigger the commands.

Or use the [obsidian-vimrc-support](https://github.com/esm7/obsidian-vimrc-support) Plugin to map more useful hotkeys such as `gn` or `gp`
(Caveat: This only works when the editor mode is on).

Example `.obsidian.vimrc`.

```vimrc
" define navigation commands
exmap next_file				 obcommand neighbouring-files:next
exmap prev_file				 obcommand neighbouring-files:prev
exmap next_file_alphabetical obcommand neighbouring-files:next-alphabetical
exmap prev_file_alphabetical obcommand neighbouring-files:prev-alphabetical
exmap older_file_created	 obcommand neighbouring-files:older-created
exmap newer_file_created	 obcommand neighbouring-files:newer-created
exmap older_file_modified	 obcommand neighbouring-files:older-modified
exmap newer_file_modified	 obcommand neighbouring-files:newer-modified
" add navigation mappings
nmap gn :next_file<cr>
nmap gp :prev_file<cr>
```
