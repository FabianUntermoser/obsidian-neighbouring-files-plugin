VAULT=${HOME}/notes
FILES=main.js manifest.json

clean:
	-rm -rf *.js *.css

build:
	npm run build

install: build
	-mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	-cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

release-patch:
	npm version patch -m "release: %s"
	git push && git push --tags
release-minor:
	npm version minor -m "release: %s"
	git push && git push --tags
release-major:
	npm version major -m "release: %s"
	git push && git push --tags

dev:
	npm run dev
