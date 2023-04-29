# Navigate to Neighbouring Files

This [Obsidian](https://obsidian.md/) Plugin adds two commands.

- Neighbouring Files: Navigate to next file in folder
- Neighbouring Files: Navigate to prev file in folder

It enables you to navigate to the file next/previous to the currently active one based on a name sort.

## How I use this

I map both commands to a shortcut using the [obsidian-vimrc-support](https://github.com/esm7/obsidian-vimrc-support) Plugin.
Here's my configuration from my `.obsidian.vimrc`.

```vimrc
" navigation to neighbouring files
exmap next_file obcommand obsidian-neighbouring-files-plugin:next
exmap prev_file obcommand obsidian-neighbouring-files-plugin:prev
nmap gn :next_file
nmap gp :prev_file
```

This enables me to navigate to neighbouring files quickly.

Examples:

- Navigate to the next daily from `2023-04-31` to `2023-05-01`
- Navigate to the next weekly from `2023-W17` to `2023-W18`
- Navigate to the next lecture note from `CS4` to `CS5`
