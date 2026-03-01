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
	-mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	-cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

install-test-vault: build # install plugin to test vault
	-mkdir -p ./vault/.obsidian/plugins/neighbouring-files/
	-cp -rf $(FILES) ./vault/.obsidian/plugins/neighbouring-files/

changeset:
	npx changeset

release:
	npx changeset version
	git add .changeset CHANGELOG.md package.json
	VERSION=$$(node -p "require('./package.json').version"); npm version --allow-same-version --force "$$VERSION" -m "release: %s"
	git push && git push --tags
