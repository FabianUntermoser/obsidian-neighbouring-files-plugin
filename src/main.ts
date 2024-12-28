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
	}

	onunload() { }
}
