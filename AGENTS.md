# neighbouring-files

Obsidian community plugin, TypeScript bundled by esbuild, jest tests.

`make help` lists the targets. What follows is what no target, hook or rule can say.

## Release

1. A change, and the bump that `make release` writes on a local `release/<version>` branch, is a pull request, and it goes green.
2. The Obsidian community scan must pass before that pull request merges: <https://community.obsidian.md/account/plugins/neighbouring-files/review-branch>. It needs the account login, so it stays manual.
3. After the bump merges, `PUBLISH_OK=1 make publish` tags it and `release.yml` builds a **draft** release. The draft goes public only on a manual publish.

## Gaps

- Tags: the `main` ruleset covers the branch, not `refs/tags/*`, so `make publish` is the only thing between a release and a hand-made tag.
- `versions.json` maps every released version to its `minAppVersion`, and nothing checks it.
