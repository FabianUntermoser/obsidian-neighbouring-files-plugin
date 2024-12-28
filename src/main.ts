import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { Plugin } from "obsidian";

export default class NeighbouringFileNavigatorPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => NeighbouringFileNavigator.navigateToNextFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev",
			name: "Navigate to previous file",
			callback: () => NeighbouringFileNavigator.navigateToPrevFile(this.app.workspace),
		});

		this.addCommand({
			id: "next-created",
			name: "Navigate to next created file",
			callback: () => NeighbouringFileNavigator.navigateToNextCreatedFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev-created",
			name: "Navigate to previous created file",
			callback: () => NeighbouringFileNavigator.navigateToPrevCreatedFile(this.app.workspace),
		});

		this.addCommand({
			id: "next-modified",
			name: "Navigate to next modified file",
			callback: () => NeighbouringFileNavigator.navigateToNextModifiedFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev-modified",
			name: "Navigate to previous modified file",
			callback: () => NeighbouringFileNavigator.navigateToPrevModifiedFile(this.app.workspace),
		});
	}

	onunload() { }
}
