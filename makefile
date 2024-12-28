VAULT=${HOME}/notes
FILES=main.js manifest.json

clean:
	-rm -rf *.js *.css

build:
	npm run build

install: build
	-mkdir -p $(VAULT)/.obsidian/plugins/neighbouring-files/
	-cp -rf $(FILES) $(VAULT)/.obsidian/plugins/neighbouring-files/

dev:
	npm run dev
