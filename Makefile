.DEFAULT_GOAL := help

VAULT=${HOME}/notes
FILES=main.js manifest.json styles.css

.PHONY: help clean dev build verify install install-user-vault install-test-vault changeset release publish

help: ## show this help
	@echo "Usage: make <target>"
	@echo
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

clean: ## remove generated build artifacts
	-rm -rf main.js *.map

dev: ## run esbuild in watch mode
	npm run dev

build: ## type-check and bundle
	npm run build

install: install-user-vault ## alias for install-user-vault

install-user-vault: build ## build + install plugin to the user vault
	mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

install-test-vault: build ## build + install plugin to the test vault
	mkdir -p ./vault/.obsidian/plugins/neighbouring-files/
	cp -rf $(FILES) ./vault/.obsidian/plugins/neighbouring-files/

changeset: ## create a changeset
	npx changeset

verify: ## run what CI runs: build, tests, lint, format check
	npm run build
	npm test
	npm run lint
	npm run format:check

release: ## bump and changelog on a release branch, nothing is pushed
	test "$$(git branch --show-current)" = "main" || (echo "error: release runs on main, so the bump branches off the default branch" >&2; exit 1)
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	npx changeset version
	test -n "$$(git status --porcelain)" || (echo "error: no changeset found, run make changeset" >&2; exit 1)
	VERSION=$$(node -p "require('./package.json').version"); \
	git switch -c "release/$$VERSION" && \
	node version-bump.mjs "$$VERSION" && \
	git add .changeset CHANGELOG.md manifest.json versions.json package.json && \
	git commit -m "chore(release): $$VERSION" && \
	echo "nothing pushed. next: AGENTS.md, Release step 3"

publish: ## tag the merged release so release.yml builds it; needs PUBLISH_OK=1
	test "$${PUBLISH_OK:-}" = "1" || (echo "error: publish is public. Set PUBLISH_OK=1 once the release PR is merged and reviewed." >&2; exit 1)
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	test "$$(git branch --show-current)" = "main" || (echo "error: publish runs on main, after the release PR merged" >&2; exit 1)
	git fetch origin main --tags
	test "$$(git rev-parse HEAD)" = "$$(git rev-parse origin/main)" || (echo "error: HEAD is not origin/main, pull and rerun" >&2; exit 1)
	VERSION=$$(node -p "require('./package.json').version"); \
	git tag -a "$$VERSION" -m "$$VERSION" && \
	git push origin "$$VERSION" && \
	echo "tagged $$VERSION, release.yml builds a draft release"
