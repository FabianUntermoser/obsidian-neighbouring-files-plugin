.DEFAULT_GOAL := help

VAULT=${HOME}/notes
FILES=main.js manifest.json styles.css

.PHONY: help clean dev build install install-user-vault install-test-vault changeset release publish

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

release: ## bump, changelog and commit on a release branch, nothing is pushed
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	npx changeset version
	# capture the bumped version once, in a single shell, so the later steps
	# (version-bump, npm version) see it; Make runs each recipe line in its
	# own shell, so a bare assignment does not carry across lines
	VERSION=$$(node -p "require('./package.json').version"); \
	git switch -c "release/$$VERSION" && \
	node version-bump.mjs "$$VERSION" && \
	git add .changeset CHANGELOG.md manifest.json versions.json package.json && \
	git commit -m "chore(release): $$VERSION"

publish: ## tag the merged release, which fires release.yml. Needs PUBLISH_OK=1
	test "$${PUBLISH_OK:-}" = "1" || (echo "error: publish tags and pushes a release. Set PUBLISH_OK=1 once it is merged and reviewed." >&2; exit 1)
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	test "$$(git branch --show-current)" = "main" || (echo "error: publish runs on main, after the release merges" >&2; exit 1)
	VERSION=$$(node -p "require('./package.json').version"); \
	git tag -a "$$VERSION" -m "$$VERSION" && \
	git push origin "$$VERSION"
