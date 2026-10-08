# Security Policy

## Reporting a vulnerability

Report a vulnerability privately through GitHub, not in a normal issue:

1. Open the repository: <https://github.com/FabianUntermoser/obsidian-neighbouring-files-plugin>
2. Open the **Security** tab.
3. Click **Report a vulnerability**.

The report is private. Only the maintainer sees it, and it does not open a public issue. A normal issue is public, so nothing sensitive goes into one.

## Scope

The plugin reads vault structure, not vault content. It asks Obsidian for the file and folder tree, then uses file names, file extensions and the created or modified timestamps to pick the target file. It never reads or writes the contents of a note or any other file, and opening the target file goes through Obsidian's own workspace API. The plugin's own settings are stored by Obsidian in its plugin data file (`data.json`, listed in `.gitignore`), inside the plugin folder. It ships to desktop and mobile (`isDesktopOnly: false` in `manifest.json`).

The plugin makes no network requests. `src/` holds no `requestUrl`, `fetch` or `XMLHttpRequest` call, and nothing that uploads, syncs or transmits data. Vault data stays in the vault.

Reports that fit this project: path handling that reaches outside the active folder or the vault, unsafe handling of a file or folder name, and anything that makes the plugin touch file contents or the network.

## Supported versions

Fixes land in the latest version published to the Obsidian community store, which is 1.2.2. Earlier versions are not patched.

Updates come through the community store: in Obsidian open Settings, then Community plugins, then Check for updates.

## What to include in a report

- Obsidian version (Settings, then About)
- Plugin version (Settings, then Community plugins)
- Platform and OS version, desktop or mobile
- The shortest reproduction: the fewest steps that still show the problem, and the folder layout involved
- What you expected, and what happened instead
