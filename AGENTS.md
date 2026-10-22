# neighbouring-files

Obsidian community plugin. TypeScript sources, esbuild bundle, jest tests. Ships `main.js`, `manifest.json` and `styles.css` to the community store.

## Commands

| Command | Does |
| --- | --- |
| `make verify` | what CI runs: build, tests, lint, format check |
| `make smoke` | loads the built bundle against a stubbed `obsidian` API |
| `make install-user-vault` | build and copy into `~/notes/.obsidian/plugins/neighbouring-files` |
| `make release` | bump and changelog on a `release/<version>` branch, pushes nothing |
| `make publish` | tag the merged release, which fires `release.yml` |

## Release

Never push `main`, never create a tag by hand, never publish a draft release. `main` is protected, and a release is a sequence where every step is deliberate.

1. A change carries a changeset (`.changeset/<name>.md`) and its pull request is green: `build` and CodeQL.
2. The maintainer clears the community dashboard branch review at <https://community.obsidian.md/account/plugins/neighbouring-files/review-branch>. Only the maintainer can do this. Ask for it, never assume it happened.
3. Merge the pull request, squash.
4. `make release` writes the bump on a local `release/<version>` branch and stops. Push that branch, open its pull request, and let it clear steps 1 and 2 like any other change. A tooling fix rides this branch, never a release of its own.
5. Once the release pull request is merged, from `main`: `PUBLISH_OK=1 make publish`. That tags and pushes the tag.
6. `release.yml` builds and attests the tag into a **draft** GitHub release.
7. Publishing the draft is public and needs the maintainer's explicit yes.

## Never

- push to `main` or create a tag outside step 5
- publish a draft release without an explicit yes
- amend, force-push, or delete a release tag
- say a release is out before the draft is published

## Conventions

Conventional commits, `type(scope): what it does`. The `commit-msg` and `pre-push` hooks are global on the maintainer's machine, so a subject a hook refuses gets reworded, never bypassed. `versions.json` maps every released version to its `minAppVersion`.
