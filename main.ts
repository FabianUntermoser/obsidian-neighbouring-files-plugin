import { Plugin, TFile } from "obsidian";

export default class NeighbouringFileNavigator extends Plugin {
	getNeighbouringFiles(file: TFile) {
		const files = file.parent?.children;
		const filteredFiles = files?.filter(file => file instanceof TFile && file.extension === 'md');
		const sortedFiles = filteredFiles?.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, {
				numeric: true,
				sensitivity: 'base',
			}))
		return sortedFiles;
	}

	navigateToNeighbouringFile(next?: boolean) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile);
		if (!files) return;

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

	onunload() { }
}
