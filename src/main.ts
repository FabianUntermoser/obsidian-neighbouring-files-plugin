import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings from "NeighbouringFileNavigatorPluginSettings";
import NeighbouringFileNavigatorPluginSettingTab from "NeighbouringFileNavigatorPluginSettingTab";
import { Plugin } from "obsidian";

const DEFAULT_SETTINGS: Partial<NeighbouringFileNavigatorPluginSettings> = {
	defaultSortOrder: 'alphabetical',
};

export default class NeighbouringFileNavigatorPlugin extends Plugin {

	settings: NeighbouringFileNavigatorPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NeighbouringFileNavigatorPluginSettingTab(this.app, this));

		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => NeighbouringFileNavigator.navigateToNextFile(this.app.workspace, this.settings),
		});
		this.addCommand({
			id: "prev",
			name: "Navigate to prev file",
			callback: () => NeighbouringFileNavigator.navigateToPrevFile(this.app.workspace, this.settings),
		});

		this.addCommand({
			id: "next-alphabetical",
			name: "Navigate to next file (alphabetical)",
			callback: () => NeighbouringFileNavigator.navigateToNextAlphabeticalFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev-alphabetical",
			name: "Navigate to prev file (alphabetical)",
			callback: () => NeighbouringFileNavigator.navigateToPrevAlphabeticalFile(this.app.workspace),
		});

		this.addCommand({
			id: "next-created",
			name: "Navigate to next file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNextCreatedFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev-created",
			name: "Navigate to prev file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToPrevCreatedFile(this.app.workspace),
		});

		this.addCommand({
			id: "next-modified",
			name: "Navigate to next file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNextModifiedFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev-modified",
			name: "Navigate to prev file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToPrevModifiedFile(this.app.workspace),
		});
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
