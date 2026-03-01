# Test Vault

This directory is a local Obsidian test vault used for manual plugin testing.

## Purpose

-   Keep a stable sample note/folder structure for navigation scenarios.
-   Test plugin behavior without touching your primary vault.
-   Mirror a keyboard-driven setup: Vim mode is enabled (`.obsidian/app.json`).
-   `obsidian-vimrc-support` is installed and configured via [`vault/.obsidian.vimrc`](./.obsidian.vimrc).

## Usage

1. Build and install the current plugin into this test vault:
    ```bash
    make install-test-vault
    ```
2. Open this `vault` folder in Obsidian.
3. Enable/reload the `neighbouring-files` plugin and test changes.
