VAULT=${HOME}/notes
FILES=main.js manifest.json

clean:
	-rm -rf *.js *.css

dev:
	npm run dev

build:
	npm run build

install: install-user-vault

install-user-vault: build # install plugin to user vault
	mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

install-test-vault: build # install plugin to test vault
	mkdir -p ./vault/.obsidian/plugins/neighbouring-files/
	cp -rf $(FILES) ./vault/.obsidian/plugins/neighbouring-files/

changeset:
	npx changeset

release:
	test -z "$$(git status --porcelain)" || (echo "error: working tree not clean" >&2; exit 1)
	npx changeset version
	VERSION=$$(node -p "require('./package.json').version"); node version-bump.mjs "$$VERSION"
	git add .changeset CHANGELOG.md manifest.json versions.json package.json
	npm version --allow-same-version --force "$$VERSION" -m "release: %s"
	git push && git push --tags
