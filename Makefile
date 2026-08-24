.DEFAULT_GOAL := help

VAULT=${HOME}/notes
FILES=main.js manifest.json styles.css

.PHONY: help clean dev build install install-user-vault install-test-vault changeset release

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

release: ## version, changelog, commit and push a release
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	npx changeset version
	VERSION=$$(node -p "require('./package.json').version"); node version-bump.mjs "$$VERSION"
	git add .changeset CHANGELOG.md manifest.json versions.json package.json
	npm version --allow-same-version --force "$$VERSION" -m "release: %s"
	git push && git push --tags
