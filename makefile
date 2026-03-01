VAULT=${HOME}/notes
FILES=main.js manifest.json

clean:
	-rm -rf *.js *.css

build:
	npm run build

install: build
	-mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	-cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

changeset:
	npx changeset

release:
	npx changeset version
	git add .changeset CHANGELOG.md package.json
	VERSION=$$(node -p "require('./package.json').version"); npm version --allow-same-version --force "$$VERSION" -m "release: %s"
	git push && git push --tags
	VERSION=$$(node -p "require('./package.json').version"); npm version --allow-same-version --force "$$VERSION" -m "release: %s"
	git push && git push --tags

dev:
	npm run dev
