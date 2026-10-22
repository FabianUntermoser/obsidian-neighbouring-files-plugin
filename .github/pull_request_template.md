<!-- USAGE: pull request checklist, the release gate is the last block -->
## What

## Verification

- [ ] `make verify`
- [ ] `make smoke`

## Release gate

- [ ] community dashboard branch review cleared by the maintainer at <https://community.obsidian.md/account/plugins/neighbouring-files/review-branch>
- [ ] no push to `main` and no tag in this branch: those belong to `make publish`
