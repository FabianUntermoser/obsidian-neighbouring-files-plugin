import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { Plugin, TFile } from "obsidian";

export default class NeighbouringFileNavigatorPlugin extends Plugin {

	navigateToNeighbouringFile(next?: boolean) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;

		const files = NeighbouringFileNavigator.getNeighbouringFiles(activeFile);
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

		this.app.workspace.getLeaf(false).openFile(toFile as TFile);
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
