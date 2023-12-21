# Navigate to Neighbouring Files

This [Obsidian](https://obsidian.md/) Plugin adds two commands.

- Neighbouring Files: Navigate to next file
- Neighbouring Files: Navigate to prev file

This enables you to navigate to a file located immediately before or after the currently active one.
Files are sorted based on their file name.

## Examples

- Navigate to the next weekly from `2023-W17` to `2023-W18`
- Navigate to the next daily from `2023-04-31` to `2023-05-01`
- Navigate to the next file from `CS4` to `CS5`

## How I use this

I map both commands to a shortcut using the [obsidian-vimrc-support](https://github.com/esm7/obsidian-vimrc-support) Plugin.
Here's my configuration from my `.obsidian.vimrc`.

```vimrc
" navigation to neighbouring files
exmap next_file obcommand neighbouring-files-plugin:next
exmap prev_file obcommand neighbouring-files-plugin:prev
nmap gn :next_file
nmap gp :prev_file
```

This enables me to navigate to neighbouring files quickly.

Caveat: This only works when the editor mode is on.
