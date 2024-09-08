import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { Plugin } from "obsidian";

export default class NeighbouringFileNavigatorPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, true),
		});

		this.addCommand({
			id: "prev",
			name: "Navigate to previous file",
			callback: () => NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, false),
		});
	}

	onunload() { }
}
