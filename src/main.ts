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
			id: "older-created",
			name: "Navigate to older file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToOlderCreatedFile(this.app.workspace),
		});
		this.addCommand({
			id: "newer-created",
			name: "Navigate to newer file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNewerCreatedFile(this.app.workspace),
		});

		this.addCommand({
			id: "older-modified",
			name: "Navigate to older file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToOlderModifiedFile(this.app.workspace),
		});
		this.addCommand({
			id: "newer-modified",
			name: "Navigate to newer file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNewerModifiedFile(this.app.workspace),
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
