import { Plugin, TFile } from "obsidian";

export default class NeighbouringFileNavigator extends Plugin {
	getNeighbouringFiles(file: TFile) {
		const files = file.parent?.children;
		return files;
	}

	navigateToNeighbouringFile(next?: boolean) {
		const activeFile = this.app.workspace.getActiveFile();
		const files = activeFile?.parent?.children?.filter(file => file instanceof TFile && file.extension === 'md');

		files?.sort((a, b) => (a.name > b.name ? 1 : -1));
		if (!activeFile || !files) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		const toFile = next
			? files[(currentItem + 1) % files.length]
			: files[
					currentItem == 0
						? files.length - 1
						: (currentItem - 1) % files.length
			  ];

		this.app.workspace.openLinkText(toFile.path, "", false);
	}

	async onload() {
		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => this.navigateToNeighbouringFile(true),
		});

		this.addCommand({
			id: "prev",
			name: "Navigate to previous file",
			callback: () => this.navigateToNeighbouringFile(false),
		});
	}

	onunload() {}
}
