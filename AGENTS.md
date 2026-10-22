# neighbouring-files

Obsidian community plugin. TypeScript sources bundled by esbuild, jest tests, ships `main.js`, `manifest.json` and `styles.css` to the community store.

`make help` lists the targets. This file holds only what a target cannot say.

## Release

`main` is protected, and every change arrives as a pull request, a release bump included.

1. A change carries a changeset (`.changeset/<name>.md`) and its pull request is green.
2. The maintainer clears the community dashboard branch review at <https://community.obsidian.md/account/plugins/neighbouring-files/review-branch>. Only the maintainer can do this. Ask for it, never assume it happened.
3. `make release` writes the bump on a local `release/<version>` branch and pushes nothing. Push that branch and open its pull request, so the bump is reviewed like any other change. A tooling fix rides this branch, never a release of its own.
4. After the bump merges, `PUBLISH_OK=1 make publish` tags it, and `release.yml` builds that tag into a **draft** release.
5. Publishing the draft is public and needs the maintainer's explicit yes.

## Never

- push `main` or create a tag outside step 4
- publish a draft release without an explicit yes
- amend, force-push, or delete a release tag
- call a release out before the draft is published

## Conventions

Conventional commits, `type(scope): what it does`. The `commit-msg` and `pre-push` hooks are global on the maintainer's machine, so a subject a hook refuses gets reworded, never bypassed. `versions.json` maps every released version to its `minAppVersion`.
